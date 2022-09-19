import { VError } from 'errors';
import { AssetSnapshot, VTokenId } from 'types';
import { getVBepToken, restService } from 'utilities';

export interface GetAssetHistoryResponse {
  limit: number;
  total: number;
  result: AssetSnapshot[];
}

export interface GetAssetHistoryInput {
  vTokenId: VTokenId;
  limit?: number;
  type?: string;
}

export type GetAssetHistoryOutput = {
  assetSnapshots: AssetSnapshot[];
};

const getAssetHistory = async ({
  vTokenId,
  limit = 30,
  type = '1day',
}: GetAssetHistoryInput): Promise<GetAssetHistoryOutput> => {
  const tokenAddress = getVBepToken(vTokenId).address;

  let endpoint = `/market_history/graph?asset=${tokenAddress}&type=${type}`;
  if (limit) {
    endpoint += `&limit=${limit}`;
  }

  const response = await restService<GetAssetHistoryResponse>({
    endpoint,
    method: 'GET',
  });

  // @todo Add specific api error handling
  if ('result' in response && response.result === 'error') {
    throw new VError({
      type: 'unexpected',
      code: 'somethingWentWrong',
      data: { message: response.message },
    });
  }

  return {
    assetSnapshots: response.data?.data.result || [],
  };
};

export default getAssetHistory;
