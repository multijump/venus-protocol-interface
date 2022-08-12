/** @jsxImportSource @emotion/react */
import { Paper, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { AnchorButton, Spinner, Table, TableAlign, TableColumnProps } from 'components';
import React, { useMemo } from 'react';
import { useTranslation } from 'translation';
import { VoteDetailTransaction } from 'types';
import { convertWeiToTokens, generateBscScanUrl } from 'utilities';

import ActionCell from './ActionCell';
import { useStyles } from './styles';

interface TransactionsProps {
  className?: string;
  address: string;
  voterTransactions: VoteDetailTransaction[] | undefined;
}

export const Transactions: React.FC<TransactionsProps> = ({
  className,
  address,
  voterTransactions = [],
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  const rows = useMemo(
    () =>
      voterTransactions.map(voterTransaction => {
        let amountWei = new BigNumber(0);

        if (voterTransaction.type === 'transfer') {
          ({ amountWei } = voterTransaction);
        } else if (voterTransaction.type === 'vote') {
          amountWei = voterTransaction.votesWei;
        }

        return {
          action: {
            value:
              voterTransaction.type === 'vote' ? voterTransaction.support : voterTransaction.to,
            voterTransaction,
            align: 'left' as TableAlign,
          },
          sent: {
            value: voterTransaction.blockTimestamp.toDateString(),
            align: 'left' as TableAlign,
          },
          amount: {
            value: amountWei.toFixed(),
            align: 'right' as TableAlign,
          },
        };
      }),
    [JSON.stringify(voterTransactions)],
  );

  const columns: TableColumnProps<typeof rows[number]>[] = useMemo(
    () => [
      {
        key: 'action',
        label: t('voterDetail.actions'),
        orderable: false,
        align: 'left' as TableAlign,
      },
      { key: 'sent', label: t('voterDetail.sent'), orderable: false, align: 'left' as TableAlign },
      {
        key: 'amount',
        label: t('voterDetail.amount'),
        orderable: false,
        align: 'right' as TableAlign,
      },
    ],
    [],
  );

  const renderCell = ({
    row,
    columnKey,
  }: {
    row: typeof rows[number];
    columnKey: keyof typeof rows[number];
  }) => {
    if (columnKey === 'action') {
      return <ActionCell voterAddress={address} transaction={row.action.voterTransaction} />;
    }

    if (columnKey === 'sent') {
      return t('voterDetail.readableSent', { date: new Date(row.sent.value) });
    }

    if (columnKey === 'amount') {
      return convertWeiToTokens({
        valueWei: new BigNumber(row.amount.value),
        tokenId: 'xvs',
        minimizeDecimals: true,
        returnInReadableFormat: true,
      });
    }
  };

  return (
    <Paper css={styles.root} className={className}>
      <Typography css={styles.horizontalPadding} variant="h4">
        {t('voterDetail.transactions')}
      </Typography>

      {voterTransactions && voterTransactions.length ? (
        <Table
          data={rows}
          columns={columns}
          renderCell={renderCell}
          keyExtractor={row =>
            `voter-transactions-table-row-${row.action.value}-${row.sent.value}-${row.amount.value}`
          }
          tableCss={styles.table}
          cardsCss={styles.cards}
          css={styles.cardContentGrid}
        />
      ) : (
        <Spinner css={styles.spinner} />
      )}

      <AnchorButton
        css={[styles.horizontalPadding, styles.anchorButton]}
        variant="secondary"
        href={generateBscScanUrl(address, 'address')}
      >
        {t('voterDetail.viewAll')}
      </AnchorButton>
    </Paper>
  );
};

export default Transactions;
