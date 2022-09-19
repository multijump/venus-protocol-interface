import BigNumber from 'bignumber.js';
import { UserAsset } from 'types';
import { convertWeiToTokens } from 'utilities';

const calculateCollateralValue = ({
  tokenId,
  tokenPriceDollars,
  collateralFactor,
  amountWei,
}: {
  tokenId: UserAsset['id'];
  tokenPriceDollars: UserAsset['tokenPriceDollars'];
  collateralFactor: UserAsset['collateralFactor'];
  amountWei: BigNumber;
}) => {
  const collateralValue = convertWeiToTokens({ valueWei: amountWei, tokenId })
    .times(tokenPriceDollars)
    .times(collateralFactor);

  return collateralValue;
};

export default calculateCollateralValue;
