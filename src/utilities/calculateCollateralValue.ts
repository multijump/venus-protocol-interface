import BigNumber from 'bignumber.js';
import { Market } from 'types';
import { convertWeiToTokens } from 'utilities';

const calculateCollateralValue = ({
  tokenId,
  tokenPriceDollars,
  collateralFactor,
  amountWei,
}: {
  tokenId: Market['id'];
  tokenPriceDollars: Market['tokenPriceDollars'];
  collateralFactor: Market['collateralFactor'];
  amountWei: BigNumber;
}) => {
  const collateralValue = convertWeiToTokens({ valueWei: amountWei, tokenId })
    .times(tokenPriceDollars)
    .times(collateralFactor);

  return collateralValue;
};

export default calculateCollateralValue;
