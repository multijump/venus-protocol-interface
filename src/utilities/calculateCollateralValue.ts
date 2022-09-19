import BigNumber from 'bignumber.js';
import { UserAsset } from 'types';
import { convertWeiToTokens } from 'utilities';

const calculateCollateralValue = ({
  tokenId,
  tokenPriceTokens,
  collateralFactor,
  amountWei,
}: {
  tokenId: UserAsset['id'];
  tokenPriceTokens: UserAsset['tokenPrice'];
  collateralFactor: UserAsset['collateralFactor'];
  amountWei: BigNumber;
}) => {
  const collateralValue = convertWeiToTokens({ valueWei: amountWei, tokenId })
    .times(tokenPriceTokens)
    .times(collateralFactor);
  return collateralValue;
};

export default calculateCollateralValue;
