import { prisma } from '../lib/prisma';

const managerInfo = {
    select: {
        id: true,
        title: true,
        firstName: true,
        lastName: true,
    },
} as const;

export const getVolProjects = async () => {
    const projectDetails = await prisma.volunteerProject.findMany({
        orderBy: { title: 'desc' },
        select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            initiatorName: true,
            organisingTeam: true,
            approvalStatus: true,
            managedBy: managerInfo,

        }
    })

    return projectDetails;
}