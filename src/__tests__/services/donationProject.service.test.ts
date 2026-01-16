import * as donationProjectService from '../../services/donationProject.service';
import * as donationProjectModel from '../../models/donationProject.model';
import { NotFoundError } from '../../utils/errors';

jest.mock('../../models/donationProject.model');

const mockedModel = donationProjectModel as jest.Mocked<typeof donationProjectModel>;

describe('donationProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('duplicateDonationProject', () => {
    const mockProjectId = 'project-uuid-123';
    const mockNewManagerId = 'manager-uuid-456';

    const mockDuplicatedProject = {
      id: 'new-project-uuid-789',
      managedBy: mockNewManagerId,
      title: 'Test Project (Copy)',
      location: 'Test Location',
      about: 'Test About',
      objectives: 'Test Objectives',
      beneficiaries: null,
      initiatorName: null,
      organisingTeam: null,
      targetFund: null,
      brickSize: null,
      deadline: null,
      type: 'brick' as const,
      startDate: new Date(),
      endDate: new Date(),
      submissionStatus: 'draft' as const,
      approvalStatus: 'pending' as const,
      approvalNotes: null,
      image: null,
      attachments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      project_manager: {
        id: mockNewManagerId,
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
      },
      objectivesList: [
        { id: 'obj-1', projectId: 'new-project-uuid-789', objective: 'Objective 1', order: 1, createdAt: new Date(), updatedAt: new Date() },
      ],
    };

    it('should duplicate a donation project successfully', async () => {
      mockedModel.duplicateDonationProject.mockResolvedValue(mockDuplicatedProject);

      const result = await donationProjectService.duplicateDonationProject(
        mockProjectId,
        mockNewManagerId
      );

      expect(mockedModel.duplicateDonationProject).toHaveBeenCalledWith(
        mockProjectId,
        mockNewManagerId
      );
      expect(result).toEqual(mockDuplicatedProject);
      expect(result.title).toContain('(Copy)');
      expect(result.submissionStatus).toBe('draft');
      expect(result.approvalStatus).toBe('pending');
    });

    it('should throw NotFoundError when project does not exist', async () => {
      mockedModel.duplicateDonationProject.mockResolvedValue(null);

      await expect(
        donationProjectService.duplicateDonationProject(mockProjectId, mockNewManagerId)
      ).rejects.toThrow(NotFoundError);

      await expect(
        donationProjectService.duplicateDonationProject(mockProjectId, mockNewManagerId)
      ).rejects.toThrow(`Donation Project ${mockProjectId} Not Found!`);
    });
  });
});
