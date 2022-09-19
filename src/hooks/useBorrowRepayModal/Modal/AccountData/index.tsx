/** @jsxImportSource @emotion/react */
import BigNumber from 'bignumber.js';
import {
  BorrowBalanceAccountHealth,
  Delimiter,
  LabeledInlineContent,
  ValueUpdate,
} from 'components';
import React, { useContext } from 'react';
import { useTranslation } from 'translation';
import { UserAsset } from 'types';
import {
  calculateDailyEarningsCents as calculateDailyEarningsCentsUtil,
  calculatePercentage,
  calculateYearlyEarningsForAssets,
  formatToReadablePercentage,
} from 'utilities';

import { useGetUserAssets } from 'clients/api';
import { SAFE_BORROW_LIMIT_PERCENTAGE } from 'constants/safeBorrowLimitPercentage';
import { AuthContext } from 'context/AuthContext';

import { useStyles as useSharedStyles } from '../styles';

export interface AccountDataProps {
  asset: UserAsset;
  hypotheticalBorrowAmountTokens: number;
  includeXvs: boolean;
}

const AccountData: React.FC<AccountDataProps> = ({
  asset,
  hypotheticalBorrowAmountTokens,
  includeXvs,
}) => {
  const { t } = useTranslation();
  const sharedStyles = useSharedStyles();
  const { account: { address: accountAddress = '' } = {} } = useContext(AuthContext);

  // TODO: handle loading state (see VEN-591)
  const {
    data: { assets, userTotalBorrowBalanceCents, userTotalBorrowLimitCents },
  } = useGetUserAssets({
    accountAddress,
  });

  const hypotheticalTotalBorrowBalanceCents =
    hypotheticalBorrowAmountTokens !== 0
      ? userTotalBorrowBalanceCents +
        asset.tokenPriceDollars *
          hypotheticalBorrowAmountTokens *
          // Convert dollars to cents
          100
      : undefined;

  const borrowLimitUsedPercentage = React.useMemo(
    () =>
      calculatePercentage({
        numerator: userTotalBorrowBalanceCents,
        denominator: userTotalBorrowLimitCents,
      }),
    [userTotalBorrowBalanceCents, userTotalBorrowLimitCents],
  );

  const hypotheticalBorrowLimitUsedPercentage =
    hypotheticalTotalBorrowBalanceCents &&
    calculatePercentage({
      numerator: hypotheticalTotalBorrowBalanceCents,
      denominator: userTotalBorrowLimitCents,
    });

  const calculateDailyEarningsCents = React.useCallback(
    (tokenAmount: BigNumber) => {
      const updatedAssets = assets.map(userAssets => ({
        ...userAssets,
        borrowBalance:
          userAssets.id === asset.id
            ? userAssets.borrowBalanceTokens.plus(tokenAmount)
            : userAssets.borrowBalanceTokens,
      }));

      const yearlyEarningsCents = calculateYearlyEarningsForAssets({
        assets: updatedAssets,
        includeXvs,
      });

      return yearlyEarningsCents && calculateDailyEarningsCentsUtil(yearlyEarningsCents);
    },
    [JSON.stringify(assets)],
  );

  const dailyEarningsCents = calculateDailyEarningsCents(new BigNumber(0));
  const hypotheticalDailyEarningsCents =
    hypotheticalBorrowAmountTokens !== 0
      ? calculateDailyEarningsCents(new BigNumber(hypotheticalBorrowAmountTokens))
      : undefined;

  const readableBorrowApy = React.useMemo(
    () => formatToReadablePercentage(asset.borrowApy.toFixed(2)),
    [asset.borrowApy.toFixed()],
  );
  const readableDistributionApy = React.useMemo(
    () => formatToReadablePercentage(asset.xvsBorrowApy.toFixed(2)),
    [asset.xvsBorrowApy.toFixed()],
  );

  return (
    <>
      <BorrowBalanceAccountHealth
        borrowBalanceCents={userTotalBorrowBalanceCents}
        borrowLimitCents={userTotalBorrowLimitCents}
        hypotheticalBorrowBalanceCents={hypotheticalTotalBorrowBalanceCents}
        safeBorrowLimitPercentage={SAFE_BORROW_LIMIT_PERCENTAGE}
        css={sharedStyles.getRow({ isLast: true })}
      />

      <LabeledInlineContent
        label={t('borrowRepayModal.borrow.borrowLimitUsed')}
        css={sharedStyles.getRow({ isLast: false })}
      >
        <ValueUpdate
          original={borrowLimitUsedPercentage}
          update={hypotheticalBorrowLimitUsedPercentage}
          positiveDirection="desc"
          format={formatToReadablePercentage}
        />
      </LabeledInlineContent>

      <LabeledInlineContent
        label={t('borrowRepayModal.borrow.borrowBalance')}
        css={sharedStyles.getRow({ isLast: true })}
      >
        <ValueUpdate
          original={userTotalBorrowBalanceCents}
          update={hypotheticalTotalBorrowBalanceCents}
          positiveDirection="desc"
        />
      </LabeledInlineContent>

      <Delimiter css={sharedStyles.getRow({ isLast: true })} />

      <LabeledInlineContent
        label={t('borrowRepayModal.borrow.borrowAPy')}
        iconName={asset.id}
        css={sharedStyles.getRow({ isLast: false })}
      >
        {readableBorrowApy}
      </LabeledInlineContent>

      <LabeledInlineContent
        label={t('borrowRepayModal.borrow.distributionApy')}
        iconName="xvs"
        css={sharedStyles.getRow({ isLast: true })}
      >
        {readableDistributionApy}
      </LabeledInlineContent>

      <Delimiter css={sharedStyles.getRow({ isLast: true })} />

      <LabeledInlineContent
        label={t('borrowRepayModal.borrow.dailyEarnings')}
        css={sharedStyles.getRow({ isLast: true })}
      >
        <ValueUpdate original={dailyEarningsCents} update={hypotheticalDailyEarningsCents} />
      </LabeledInlineContent>
    </>
  );
};

export default AccountData;
