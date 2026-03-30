import * as donationService from '../../services/donation.service';
import * as donationModel from '../../models/donation.model';

jest.mock('../../models/donation.model');

const mockedModel = donationModel as jest.Mocked<typeof donationModel>;

class DecimalLike {
  constructor(public value: string) {}

  toString() {
    return this.value;
  }
}

describe('donationService mapDbToApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps non-plain objects intact while remapping brickSize -> brickCost', async () => {
    const createdAt = new Date('2026-03-01T10:00:00.000Z');
    const amount = new DecimalLike('123.45');

    mockedModel.getDonationDetail.mockResolvedValue({
      id: 'donation-1',
      createdAt,
      amount,
      project: {
        id: 'project-1',
        brickSize: amount,
      },
    } as any);

    const result = await donationService.getDonationDetail(
      'donation-1',
      'user-1',
    );

    expect(result.createdAt).toBe(createdAt);
    expect(result.amount).toBe(amount);
    expect(result.project.brickCost).toBe(amount);
    expect(result.project.brickSize).toBeUndefined();
  });
});
