import * as donationProjectService from '../../services/donationProject.service';
import * as donationProjectModel from '../../models/donationProject.model';
import { NotFoundError } from '../../utils/errors';

jest.mock('../../models/donationProject.model');

const mockedModel = donationProjectModel as jest.Mocked<typeof donationProjectModel>;

describe('donationProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDonationProjects', () => {
    it('maps list project brickSize to brickCost', async () => {
      mockedModel.getDonationProjects.mockResolvedValue({
        projectsWithTotals: [
          {
            id: 'project-uuid-list',
            brickSize: '50',
            totalRaised: '1250',
          },
        ],
        totalCount: 1,
      } as any);

      const result = await donationProjectService.getDonationProjects({
        viewerRole: 'partner',
        page: 1,
        limit: 10,
      } as any);

      expect(result.projects).toHaveLength(1);
      expect((result.projects[0] as any).brickCost).toBe('50');
      expect((result.projects[0] as any).brickSize).toBeUndefined();
      expect(result.pagination).toMatchObject({
        page: 1,
        limit: 10,
        totalCount: 1,
        totalPages: 1,
      });
    });
  });

  describe('getMyDonationProjectDetails', () => {
    it('maps nested project brickSize to brickCost and keeps totalRaised unchanged', async () => {
      const projectId = 'project-uuid-1';
      const managerId = 'manager-uuid-1';
      const modelResult = {
        project: {
          id: projectId,
          title: 'Project A',
          brickSize: '5000',
        },
        totalRaised: 15000,
      } as any;

      mockedModel.getMyDonationProject.mockResolvedValue(modelResult);

      const result = await donationProjectService.getMyDonationProjectDetails(
        projectId,
        managerId,
      );

      expect(mockedModel.getMyDonationProject).toHaveBeenCalledWith(
        projectId,
        managerId,
      );
      expect(result.totalRaised).toBe(15000);
      expect((result as any).project.brickCost).toBe('5000');
      expect((result as any).project.brickSize).toBeUndefined();
    });
  });

  describe('getDonationProjectDetails', () => {
    it('passes viewerRole to model and maps nested project brickSize to brickCost', async () => {
      const projectId = 'project-uuid-public';
      mockedModel.getDonationProjectById.mockResolvedValue({
        project: {
          id: projectId,
          brickSize: '3000',
        },
        totalRaised: 2000,
      } as any);

      const result = await donationProjectService.getDonationProjectDetails(
        projectId,
        'partner',
      );

      expect(mockedModel.getDonationProjectById).toHaveBeenCalledWith(
        projectId,
        'partner',
      );
      expect(result).toMatchObject({
        totalRaised: 2000,
        project: {
          id: projectId,
          brickCost: '3000',
        },
      });
      expect((result as any).project.brickSize).toBeUndefined();
    });
  });

  describe('createDonationProject', () => {
    it('maps brickCost to brickSize for create and returns brickCost in response', async () => {
      const managerId = 'manager-uuid-1';
      const input = {
        title: 'Project A',
        location: 'Yangon',
        about: 'About',
        objectives: 'Objectives',
        type: 'brick' as const,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        brickCost: '1000',
      } as any;

      mockedModel.createDonationProject.mockResolvedValue({
        id: 'project-uuid-1',
        ...input,
        brickCost: undefined,
        brickSize: '1000',
      } as any);

      const result = await donationProjectService.createDonationProject(
        managerId,
        input,
      );

      expect(mockedModel.createDonationProject).toHaveBeenCalledWith(
        managerId,
        expect.objectContaining({ brickSize: '1000' }),
      );
      expect(mockedModel.createDonationProject).toHaveBeenCalledWith(
        managerId,
        expect.not.objectContaining({ brickCost: expect.anything() }),
      );

      expect(result).toMatchObject({
        id: 'project-uuid-1',
        brickCost: '1000',
      });
      expect((result as any).brickSize).toBeUndefined();
    });
  });

  describe('updateDonationProject', () => {
    it('maps brickCost to brickSize for partner-owned update flow', async () => {
      const projectId = 'project-uuid-1';
      const managerId = 'manager-uuid-1';
      const payload = { brickCost: '2500' } as any;

      mockedModel.updateDonationProject.mockResolvedValue({
        id: projectId,
        brickSize: '2500',
      } as any);

      const result = await donationProjectService.updateDonationProject(
        projectId,
        managerId,
        payload,
      );

      expect(mockedModel.updateDonationProject).toHaveBeenCalledWith(
        projectId,
        managerId,
        expect.objectContaining({ brickSize: '2500' }),
      );
      expect(result).toMatchObject({
        id: projectId,
        brickCost: '2500',
      });
    });
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
      brickSize: null, // Model returns brickSize from DB
      deadline: null,
      type: 'brick' as const,
      startDate: new Date(),
      endDate: new Date(),
      submissionStatus: 'draft' as const,
      approvalStatus: 'pending' as const,
      operationStatus: 'notStarted' as const,
      approvalNotes: null,
      image: null,
      attachments: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectManager: {
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
      // Service transforms brickSize -> brickCost
      expect(result).toMatchObject({
        id: mockDuplicatedProject.id,
        title: mockDuplicatedProject.title,
        brickCost: null, // Service returns brickCost
      });
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
