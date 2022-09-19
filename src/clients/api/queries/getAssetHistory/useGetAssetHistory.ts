import { QueryObserverOptions, useQuery } from 'react-query';

import getAssetHistory, {
  GetAssetHistoryInput,
  GetAssetHistoryOutput,
} from 'clients/api/queries/getAssetHistory';
import FunctionKey from 'constants/functionKey';

type Options = QueryObserverOptions<
  GetAssetHistoryOutput,
  Error,
  GetAssetHistoryOutput,
  GetAssetHistoryOutput,
  FunctionKey.GET_ASSET_HISTORY
>;

const useGetAssetHistory = (input: GetAssetHistoryInput, options?: Options) =>
  useQuery(FunctionKey.GET_ASSET_HISTORY, () => getAssetHistory(input), options);

export default useGetAssetHistory;
