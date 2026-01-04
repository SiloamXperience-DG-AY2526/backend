import { prisma } from '../lib/prisma';
import {
  UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput,
  GetAvailableVolunteerActivitiesInput
} from '../schemas/volunteer';
import { NotFoundError } from '../utils/errors';

const pmPublicInfo = {
  select: {
    id: true,
    title: true,
    firstName: true,
    lastName: true,
  },
} as const;

export const getVolunteerProjectsByManager = async (managerId: string) => {
  const projects = await prisma.volunteerProject.findMany({
    where: {
      managedById: managerId,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });
  return projects;
};

export const getVolunteerProjectById = async (
  projectId: string,
  managerId: string
) => {
  const project = await prisma.volunteerProject.findFirst({
    where: {
      id: projectId,
      managedById: managerId,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
      positions: {
        include: {
          skills: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  return project;
};

export const updateVolunteerProject = async (
  projectId: string,
  managerId: string,
  data: UpdateVolunteerProjectInput
) => {
  // First verify the project belongs to the manager
  const existingProject = await prisma.volunteerProject.findFirst({
    where: {
      id: projectId,
      managedById: managerId,
    },
  });

  if (!existingProject) {
    return null;
  }

  const updatedProject = await prisma.volunteerProject.update({
    where: {
      id: projectId,
    },
    data: {
      ...data,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return updatedProject;
};

export const createVolunteerProject = async (
  managerId: string,
  data: CreateVolunteerProjectInput
) => {
  const { objectivesList, ...projectData } = data;

  const project = await prisma.volunteerProject.create({
    data: {
      ...projectData,
      managedById: managerId,
      submissionStatus: 'draft', // New projects start as draft
      approvalStatus: 'pending', // Awaiting approval
      objectivesList: objectivesList
        ? {
          create: objectivesList.map((obj) => ({
            objective: obj.objective,
            order: obj.order,
          })),
        }
        : undefined,
    },
    include: {
      managedBy: pmPublicInfo,
      objectivesList: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return project;
};





//partner apis
type PaginatedVolunteerActivities = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: Array<{
    id: string;
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    startTime: Date;
    endTime: Date;
    operationStatus: string;

    positions: Array<{
      id: string;
      role: string;
      description: string;
      totalSlots: number;
      slotsFilled: number;
      slotsAvailable: number;
    }>;

    sessions: Array<{
      id: string;
      name: string;
      sessionDate: Date;
      startTime: Date;
      endTime: Date;

      totalSlots: number;
      slotsFilled: number;
      slotsAvailable: number;
    }>;
  }>;
};

interface SubmitVolunteerApplicationArgs {
  userId: string;
  projectId:string;
  positionId: string;
  sessionId?: string;
}

interface GetVolunteerApplicationsModelInput {
  userId: string;
  status?: 'reviewing' | 'approved' | 'rejected' | 'active' | 'inactive';
}


export const submitVolunteerApplication = async ({
  userId,
  projectId,
  positionId,
  sessionId,
}: SubmitVolunteerApplicationArgs) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('VOLUNTEER_NOT_FOUND');
    }
    const project = await tx.volunteerProject.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundError('PROJECT_NOT_FOUND');


    // 3️⃣ Position exists + belongs to project
    const position = await tx.projectPosition.findUnique({
      where: { id: positionId },
      include: {
        project: true,
        signups: {
          where: {
            status: { in: ['reviewing','approved', 'active'] },
          },
        },
      },
    });

    if (!position) {
      throw new NotFoundError('POSITION_NOT_FOUND');
    }


    if (position.projectId !== projectId) {
      throw new Error('POSITION_NOT_IN_PROJECT');
    }
  
    if (project.operationStatus !== 'ongoing') {
      throw new Error('PROJECT_NOT_ACTIVE');
    }
    const existing =
      await tx.volunteerProjectPosition.findUnique({
        where: {
          volunteerId_positionId: {
            volunteerId: userId,
            positionId,
          },
        },
      });

    if (existing) {
      throw new Error('ALREADY_APPLIED');
    }


    if (sessionId) {
      const session = await tx.session.findFirst({
        where: {
          id: sessionId,
          projectId: position.projectId,
        },
      });

      if (!session) {
        throw new NotFoundError('SESSION_NOT_FOUND');
      }
    }
    const application = await tx.volunteerProjectPosition.create({
      data: {
        volunteerId: userId,
        positionId,
        status: 'reviewing',
        hasConsented: false,
      },
    });

    if (sessionId) {
      await tx.volunteerSession.create({
        data: {
          volunteerId: userId,
          sessionId,
        },
      });
    }

    return application;
  });
};


export const getVolunteerApplicationsModel = async ({
  userId,
  status,
}: GetVolunteerApplicationsModelInput) => {
  const records = await prisma.volunteerProjectPosition.findMany({
    where: {
      volunteerId: userId,
      ...(status && { status }),
    },
    include: {
      position: {
        select: {
          id: true,
          role: true,
          project: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
              endDate: true,
              operationStatus: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return records.map((r) => ({
    applicationId: r.id,
    status: r.status,
    appliedAt: r.createdAt,
    project: {
      id: r.position.project.id,
      title: r.position.project.title,
      location: r.position.project.location,
      startDate: r.position.project.startDate,
      endDate: r.position.project.endDate,
      operationStatus: r.position.project.operationStatus,
    },
    position: {
      id: r.position.id,
      role: r.position.role,
    },
  }));
};

export const getAvailableVolunteerActivitiesModel = async ({
  page = 1,
  limit = 10,
  search,
}: GetAvailableVolunteerActivitiesInput): Promise<PaginatedVolunteerActivities> => {
  if (page < 1 || limit < 1) throw new Error('INVALID_PAGINATION');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const whereClause = {
    operationStatus: 'ongoing' as const,
    startDate: { gte: tomorrow },
    ...(search
      ? {
        title: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }
      : {}),
  };

  const skip = (page - 1) * limit;

  const [total, projects] = await Promise.all([
    prisma.volunteerProject.count({ where: whereClause }),
    prisma.volunteerProject.findMany({
      where: whereClause,
      orderBy: { startDate: 'asc' },
      skip,
      take: limit,
      include: {
        positions: {
          include: {
            signups: {
              where: {
                hasConsented: true,
                status: { in: ['approved', 'active', 'inactive'] }, //filled
              },
              select: { id: true, volunteerId: true }, 
            },
          },
        },
        sessions: {
          include: {
            volunteerSessions: {
              select: { id: true, volunteerId: true }, 
            },
          },
          orderBy: { sessionDate: 'asc' },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const data = projects.map((p) => {
  //volunteers that are filled
    const approvedVolunteerIds = new Set<string>();
    for (const pos of p.positions) {
      for (const signup of pos.signups) {
        approvedVolunteerIds.add(signup.volunteerId);
      }
    }

    const positions = p.positions.map((pos) => {
      const slotsFilled = pos.signups.length; 
      const slotsAvailable = Math.max(pos.totalSlots - slotsFilled, 0);

      return {
        id: pos.id,
        role: pos.role,
        description: pos.description,
        totalSlots: pos.totalSlots,
        slotsFilled,
        slotsAvailable,
      };
    });

    const projectTotalSlots = p.positions.reduce(
      (acc, pos) => acc + pos.totalSlots,
      0
    );

    const sessions = p.sessions.map((s) => {
      // volunteers for each session
      const slotsFilled = s.volunteerSessions.filter((vs) =>
        approvedVolunteerIds.has(vs.volunteerId)
      ).length;

      const slotsAvailable = Math.max(projectTotalSlots - slotsFilled, 0);

      return {
        id: s.id,
        name: s.name,
        sessionDate: s.sessionDate,
        startTime: s.startTime,
        endTime: s.endTime,
        totalSlots: projectTotalSlots,
        slotsFilled,
        slotsAvailable,
      };
    });

    return {
      id: p.id,
      title: p.title,
      location: p.location,
      startDate: p.startDate,
      endDate: p.endDate,
      startTime: p.startTime,
      endTime: p.endTime,
      operationStatus: p.operationStatus,
      positions,
      sessions,
    };
  });

  return {
    page,
    limit,
    total,
    totalPages,
    data,
  };
};