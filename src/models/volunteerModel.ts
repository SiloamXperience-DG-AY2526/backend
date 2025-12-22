import { prisma } from '../lib/prisma';
import { sendVolunteerApplicationEmail } from '../utils/email';
import { getResponseValue } from '../helpers/getResponseHelper';

interface SubmitVolunteerApplicationInput {
  userId: string;
  projectId: string;
  projectPositionId: string;
}

type ProjectPositionType = {
  id: string;
  title: string;
  slots: number;
  filled: number;
};

type ProjectType = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  projectPositions: ProjectPositionType[];
};

interface GetAvailableVolunteerActivitiesInput {
  page?: number;
  limit?: number;
  search?: string;
}

interface VolunteerActivityPosition {
  id: string;
  title: string;
  slots: number;
  filled: number;
  availableSlots: number;
}

interface VolunteerActivity {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  positions: VolunteerActivityPosition[];
}

interface PaginatedVolunteerActivities {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  data: VolunteerActivity[];
}

export const submitVolunteerApplicationModel = async ({
  userId,
  projectId,
  projectPositionId,
}: SubmitVolunteerApplicationInput) => {

  // get project
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new Error('PROJECT_NOT_FOUND');

  // get project position
  const projectPosition = await prisma.projectPosition.findUnique({
    where: { id: projectPositionId },
  });
  if (!projectPosition) throw new Error('PROJECT_POSITION_NOT_FOUND');

  // get volunteer
  const volunteer = await prisma.volunteer.findUnique({ where: { userId } });
  if (!volunteer) throw new Error('VOLUNTEER_NOT_FOUND');

  // get volunteer personal details 
  const submission = await prisma.submission.findUnique({
  where: { id: volunteer.formSubmissionId },
  include: {
    responses: { include: { field: true } },
  },
});

const name = getResponseValue(submission, 'name');
const gender = getResponseValue(submission, 'gender');
const contactNumber = getResponseValue(submission, 'contact_number');

  // fetch volunteer application form
  const volunteerForm = await prisma.form.findFirst({
    where: { slug: 'volunteer-application' },
    include: { fields: true },
  });

  if (!volunteerForm) {
    throw new Error('VOLUNTEER_FORM_NOT_FOUND');
  }

  // map responses to form fields
  const responsesData = volunteerForm.fields
 .map((f: typeof volunteerForm.fields[number]) => {
      switch (f.fieldAlias) {
        case 'project_title':
          return { fieldId: f.id, value: project.title };
        case 'volunteer_position':
          return { fieldId: f.id, value: projectPosition.title };
        case 'date_time':
          return { fieldId: f.id, value: project.startDate.toISOString() };
        case 'name':
          return { fieldId: f.id, value: name };
        case 'gender':
          return { fieldId: f.id, value: gender };
        case 'contact_number':
          return { fieldId: f.id, value: contactNumber };
        default:
          return null;
      }
    })
    .filter(Boolean) as { fieldId: string; value: string }[];

  // create submission
  const newSubmission = await prisma.submission.create({
    data: {
      formId: volunteerForm.id,
      userId,
      responses: { create: responsesData },
    },
    include: { responses: true },
  });

  // link volunteer to project and roles
  const volunteerProject = await prisma.volunteerProject.create({
    data: {
      volunteerId: volunteer.id,
      projectId: project.id,
      projectPositionId: projectPosition.id,
    },
  });

  // send email (non-blocking)
  sendVolunteerApplicationEmail({
    to: 'tasmiyahwork@gmail.com', // replace with actual user email
    name,
    projectTitle: project.title,
    positionTitle: projectPosition.title,
    startDate: project.startDate,
  }).catch(console.error);

  return {
    submission: newSubmission,
    volunteerProject,
  };
};

export const getVolunteerApplicationsModel = async (userId: string) => {
  // get volunteer profile
  const volunteer = await prisma.volunteer.findUnique({
    where: { userId },
  });

  if (!volunteer) {
    throw new Error('VOLUNTEER_NOT_FOUND');
  }

  // get respective volunteer applications
  const volunteerProjects = await prisma.volunteerProject.findMany({
    where: { volunteerId: volunteer.id },
    include: {
      project: true,
      projectPosition: true,
      approver: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // check status based on approvedAt field
  const applications = volunteerProjects.map(
    (vp: typeof volunteerProjects[number]) => ({
      projectId: vp.projectId,
      projectTitle: vp.project.title,
      position: vp.projectPosition.title,
      submittedAt: vp.createdAt,
      status: vp.approvedAt ? 'PROCESSED' : 'PENDING',
      approvedAt: vp.approvedAt,
      approvedBy: vp.approver?.name ?? null,
      approvalNotes: vp.approvalNotes,
    })
  );

  return { userId, applications };
};

export const getAvailableVolunteerActivitiesModel = async ({
  page = 1,
  limit = 10,
  search,
}: GetAvailableVolunteerActivitiesInput): Promise<PaginatedVolunteerActivities> => {
  const pageNumber = page;
  const pageSize = limit;

  if (pageNumber < 1 || pageSize < 1) {
    throw new Error('INVALID_PAGINATION');
  }

  const now = new Date();

  // fetch total count and paginated projects in parallel
  const [total, projects] = await Promise.all([
    // total projects count
    prisma.project.count({
      where: {
        hasVolunteering: true,
        startDate: { gte: now },
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        projectPositions: { some: {} }, // ensure project has at least one position
      },
    }),
    // paginated projects
    prisma.project.findMany({
      where: {
        hasVolunteering: true,
        startDate: { gte: now },
        ...(search && { title: { contains: search, mode: 'insensitive' } }),
        projectPositions: { some: {} },
      },
      include: { projectPositions: true }, // fetch all positions
      orderBy: { startDate: 'asc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // cannot filter project positions from db as prisma does not allow field to field comparison
  // only positions with available slots for retrieved projects
  const availableProjects = projects
    .map((project: ProjectType) => {
      const availablePositions: ProjectPositionType[] = project.projectPositions.filter(
        (pos: ProjectPositionType) => pos.filled < pos.slots
      );

      if (availablePositions.length === 0) return null; // remove projects with no available positions

      return { ...project, projectPositions: availablePositions };
    })
    .filter(Boolean) as ProjectType[];

  const totalPages = Math.ceil(total / pageSize);

  // Map projects to API response format
  const data: VolunteerActivity[] = availableProjects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    startDate: project.startDate,
    positions: project.projectPositions.map((pos: ProjectPositionType) => ({
      id: pos.id,
      title: pos.title,
      slots: pos.slots,
      filled: pos.filled,
      availableSlots: pos.slots - pos.filled,
    })),
  }));

  return {
    page: pageNumber,
    limit: pageSize,
    total,
    totalPages,
    data,
  };
};