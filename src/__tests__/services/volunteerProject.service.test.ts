import * as volunteerProjectService from '../../services/volunteerProject.service';
import * as volunteerProjectModel from '../../models/volunteerProject.model';
import { NotFoundError } from '../../utils/errors';

jest.mock('../../models/volunteerProject.model');

const mockedModel = volunteerProjectModel as jest.Mocked<typeof volunteerProjectModel>;

describe('volunteerProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('duplicateVolunteerProject', () => {
    const mockProjectId = 'vol-project-uuid-123';
    const mockNewManagerId = 'manager-uuid-456';

    const mockDuplicatedProject = {
      id: 'new-vol-project-uuid-789',
      managedById: mockNewManagerId,
      approvedById: null,
      title: 'Volunteer Project (Copy)',
      location: 'Test Location',
      aboutDesc: 'Test About',
      objectives: 'Test Objectives',
      beneficiaries: 'Test Beneficiaries',
      initiatorName: null,
      organisingTeam: null,
      proposedPlan: null,
      startTime: new Date(),
      endTime: new Date(),
      startDate: new Date(),
      endDate: new Date(),
      frequency: 'once' as const,
      interval: null,
      dayOfWeek: null,
      submissionStatus: 'draft' as const,
      approvalStatus: 'pending' as const,
      operationStatus: 'paused' as const,
      approvalNotes: null,
      approvalMessage: null,
      image: null,
      attachments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      managedBy: {
        id: mockNewManagerId,
        title: 'Ms',
        firstName: 'Jane',
        lastName: 'Smith',
      },
      objectivesList: [
        { id: 'obj-1', volunteerProjectId: 'new-vol-project-uuid-789', objective: 'Objective 1', order: 1, createdAt: new Date(), updatedAt: new Date() },
      ],
      positions: [
        {
          id: 'pos-1',
          projectId: 'new-vol-project-uuid-789',
          role: 'Coordinator',
          description: 'Coordinate activities',
          totalSlots: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
          skills: [
            { id: 'skill-1', projectPositionId: 'pos-1', skill: 'Leadership', order: 1, createdAt: new Date(), updatedAt: new Date() },
          ],
        },
      ],
      sessions: [
        {
          id: 'session-1',
          projectId: 'new-vol-project-uuid-789',
          name: 'Session 1',
          sessionDate: new Date(),
          startTime: new Date(),
          endTime: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    it('should duplicate a volunteer project successfully', async () => {
      mockedModel.duplicateVolunteerProject.mockResolvedValue(mockDuplicatedProject);

      const result = await volunteerProjectService.duplicateVolunteerProject(
        mockProjectId,
        mockNewManagerId
      );

      expect(mockedModel.duplicateVolunteerProject).toHaveBeenCalledWith(
        mockProjectId,
        mockNewManagerId
      );
      expect(result).toEqual(mockDuplicatedProject);
      expect(result.title).toContain('(Copy)');
      expect(result.submissionStatus).toBe('draft');
      expect(result.approvalStatus).toBe('pending');
      expect(result.operationStatus).toBe('paused');
      expect(result.positions).toHaveLength(1);
      expect(result.sessions).toHaveLength(1);
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockedModel.duplicateVolunteerProject.mockResolvedValue(null);

      await expect(
        volunteerProjectService.duplicateVolunteerProject(mockProjectId, mockNewManagerId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        volunteerProjectService.duplicateVolunteerProject(mockProjectId, mockNewManagerId)
      ).rejects.toThrow(`Volunteer Project ${mockProjectId} Not Found!`);
    });
  });
});
