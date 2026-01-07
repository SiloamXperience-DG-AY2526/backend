import { prisma } from '../lib/prisma';
import {
  UpdateVolunteerProjectInput,
  CreateVolunteerProjectInput,
  GetAvailableVolunteerActivitiesInput,
  ProposeVolunteerProjectInput,
} from '../schemas/project';
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


    const projectTotalSlots = positions.reduce(
      (sum, pos) => sum + pos.totalSlots,
      0
    );

    const projectAvailableSlots = positions.reduce(
      (sum, pos) => sum + pos.slotsAvailable,
      0
    );

    //session
    const approvedVolunteerIds = new Set<string>();
    for (const pos of p.positions) {
      for (const signup of pos.signups) {
        approvedVolunteerIds.add(signup.volunteerId);
      }
    }

    const sessions = p.sessions.map((s) => {
      const sessionFilled = s.volunteerSessions.filter((vs) =>
        approvedVolunteerIds.has(vs.volunteerId)
      ).length;

      const sessionAvailable = Math.max(
        projectAvailableSlots - sessionFilled,
        0
      );

      return {
        id: s.id,
        name: s.name,
        sessionDate: s.sessionDate,
        startTime: s.startTime,
        endTime: s.endTime,
        totalSlots: projectTotalSlots,
        slotsFilled: sessionFilled,
        slotsAvailable: sessionAvailable,
      };
    });
    //return all
    return {
      id: p.id,
      title: p.title,
      location: p.location,
      image: p.image,          
      aboutDesc: p.aboutDesc, 
      startDate: p.startDate,
      endDate: p.endDate,
      startTime: p.startTime,
      endTime: p.endTime,
      operationStatus: p.operationStatus,

      projectTotalSlots,       
      projectAvailableSlots,    
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

//volunteer suggest project
export const proposeVolunteerProjectModel = async ({
  proposerId,
  positions,
  ...data
}: ProposeVolunteerProjectInput & { proposerId: string }) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.volunteerProject.create({
      data: {
        ...data,

        managedById: proposerId, // volunteerid
        submissionStatus: 'draft',
        approvalStatus: 'pending',
        operationStatus: 'paused', 
      },
    });

    if (positions?.length) {
      for (const pos of positions) {
        const createdPosition = await tx.projectPosition.create({
          data: {
            projectId: project.id,
            role: pos.role,
            description: pos.description,
            totalSlots: 0,
          },
        });

        if (pos.skills?.length) {
          await tx.projectSkill.createMany({
            data: pos.skills.map((s, idx) => ({
              projectPositionId: createdPosition.id,
              skill: s,
              order: idx + 1,
            })),
          });
        }
      }
    }

    return project;
  });
};

export const updateVolunteerProposalModel = async ({
  projectId,
  userId,
  payload,
}: {
  projectId: string;
  userId: string;
  payload: any;
}) => {
  return prisma.$transaction(async (tx) => {
    const project = await tx.volunteerProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        managedById: true,
        submissionStatus: true,
      },
    });

    if (!project) throw new Error('PROJECT_NOT_FOUND');

    //  unauthorised
    if (project.managedById !== userId) {
      throw new Error('FORBIDDEN_NOT_PROJECT_OWNER');
    }

    // can edit if status is still draft
    if (project.submissionStatus !== 'draft') {
      throw new Error('ONLY_DRAFT_CAN_BE_EDITED');
    }

    // remove unnecessary detail from payload also ensuring security
    delete payload.userId;
    delete payload.managedById;
    delete payload.approvedById;

    const { positions, ...projectData } = payload;

    const updatedProject = await tx.volunteerProject.update({
      where: { id: projectId },
      data: {
        ...projectData,
      },
    });

  
    if (positions) {
      for (const pos of positions) {
        let positionId: string;

        if (pos.id) {
          const updatedPos = await tx.projectPosition.update({
            where: { id: pos.id },
            data: {
              role: pos.role,
              description: pos.description,
            },
          });
          positionId = updatedPos.id;
        } else {
          const createdPos = await tx.projectPosition.create({
            data: {
              projectId,
              role: pos.role,
              description: pos.description,
              totalSlots: 0,
            },
          });
          positionId = createdPos.id;
        }

        //update skills
        await tx.projectSkill.deleteMany({
          where: { projectPositionId: positionId },
        });

        if (pos.skills?.length) {
          await tx.projectSkill.createMany({
            data: pos.skills.map((skill: string, idx: number) => ({
              projectPositionId: positionId,
              skill,
              order: idx + 1,
            })),
          });
        }
      }
    }

    return updatedProject;
  });
};

export const withdrawVolunteerProposalModel = async ({
  projectId,
  userId,
}: {
  projectId: string;
  userId: string;
}) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.volunteerProject.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        managedById: true,
        submissionStatus: true,
      },
    });

    if (!existing) throw new Error('PROJECT_NOT_FOUND');

    // only the proposed user can withdraw
    if (existing.managedById !== userId) {
      throw new Error('FORBIDDEN');
    }

    // if already withdrawn, just return (or throw)
    if (existing.submissionStatus === 'withdrawn') {
      throw new Error('ALREADY_WITHDRAWN');
    }

    const updated = await tx.volunteerProject.update({
      where: { id: projectId },
      data: {
        submissionStatus: 'withdrawn',
      },
    });

    return updated;
  });
};

//getProjectDetail
const FILLED_STATUSES = ['approved', 'active', 'inactive'] as const;

export const getVolunteerProjectDetailModel = async ({
  projectId,
}: {
  projectId: string;
}) => {
  const p = await prisma.volunteerProject.findUnique({
    where: { id: projectId },
    select: {
      id: true,

      title: true,
      location: true,

      aboutDesc: true,
      objectives: true,
      beneficiaries: true,

      initiatorName: true,
      organisingTeam: true,
      proposedPlan: true,

      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,

      frequency: true,
      interval: true,
      dayOfWeek: true,

      submissionStatus: true,
      approvalStatus: true,
      operationStatus: true,

      image: true,
      attachments: true,

      positions: {
        select: {
          id: true,
          role: true,
          description: true,
          totalSlots: true,
          skills: {
            select: {
              id: true,
              skill: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          signups: {
            where: {
              hasConsented: true,
              status: { in: [...FILLED_STATUSES] },
            },
            select: { id: true }, // just count
          },
        },
        orderBy: { createdAt: 'asc' },
      },

      sessions: {
        select: {
          id: true,
          name: true,
          sessionDate: true,
          startTime: true,
          endTime: true,
        },
        orderBy: { sessionDate: 'asc' },
      },

      createdAt: true,
      updatedAt: true,
    },
  });

  if (!p) throw new NotFoundError('PROJECT_NOT_FOUND');

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
      skills: pos.skills.map((s) => s.skill),
    };
  });

  return {
    id: p.id,

    // title + event details
    title: p.title,
    location: p.location,
    startDate: p.startDate,
    endDate: p.endDate,
    startTime: p.startTime,
    endTime: p.endTime,
    frequency: p.frequency,
    interval: p.interval,
    dayOfWeek: p.dayOfWeek,

    // organiser + info
    initiatorName: p.initiatorName,
    organisingTeam: p.organisingTeam,
    proposedPlan: p.proposedPlan,

    // content
    aboutDesc: p.aboutDesc,
    objectives: p.objectives,
    beneficiaries: p.beneficiaries,

    // status
    submissionStatus: p.submissionStatus,
    approvalStatus: p.approvalStatus,
    operationStatus: p.operationStatus,

    // assets
    image: p.image,
    attachments: p.attachments,

    // volunteer roles
    positions,

    // optional sessions list (if you want to show event sessions)
    sessions: p.sessions,

    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

export const submitVolunteerFeedbackModel = async ({
  projectId,
  userId,
  ratings,
  feedback,
}: {
  projectId: string;
  userId: string;
  ratings: {
    overall: number;
    management: number;
    planning: number;
    facilities: number;
  };
  feedback: {
    experience: string;
    improvement: string;
    comments?: string | null;
  };
}) => {
  return prisma.$transaction(async (tx) => {
    // check project exists
    const project = await tx.volunteerProject.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) throw new NotFoundError('PROJECT_NOT_FOUND');

    // sign up exist
    const signup = await tx.volunteerProjectPosition.findFirst({
      where: {
        volunteerId: userId,
        status: { in: [...FILLED_STATUSES] },
        position: {
          projectId,
        },
      },
      select: {
        id: true,
        volunteerProjectFeedbackId: true,
      },
    });

    if (!signup) {
      throw new Error('NOT_ELIGIBLE_FOR_FEEDBACK'); 
    }

    // prevent duplicates (per volunteer position signup)
    if (signup.volunteerProjectFeedbackId) {
      throw new Error('FEEDBACK_ALREADY_SUBMITTED');
    }

    // create feedback
    const createdFeedback = await tx.volunteerProjectFeedback.create({
      data: {
        projectId,
        overallRating: ratings.overall,
        managementRating: ratings.management,
        planningRating: ratings.planning,
        resourcesRating: ratings.facilities,
        enjoyMost: feedback.experience,
        improvements: feedback.improvement,
        otherComments: feedback.comments ?? null,
      },
      select: {
        id: true,
        projectId: true,
        overallRating: true,
        managementRating: true,
        planningRating: true,
        resourcesRating: true,
        enjoyMost: true,
        improvements: true,
        otherComments: true,
        createdAt: true,
      },
    });

    // link feedback to that signup row
    await tx.volunteerProjectPosition.update({
      where: { id: signup.id },
      data: {
        volunteerProjectFeedbackId: createdFeedback.id,
      },
    });

    return {
      feedback: createdFeedback,
      linkedSignupId: signup.id,
    };
  });
};