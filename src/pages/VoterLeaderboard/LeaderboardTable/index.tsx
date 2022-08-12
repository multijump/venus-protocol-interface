/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { EllipseAddress, Table, TableAlign, TableColumnProps } from 'components';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'translation';
import { VoterAccount } from 'types';
import { convertWeiToTokens, formatToReadablePercentage } from 'utilities';

import Path from 'constants/path';

import { useStyles } from './styles';

export interface LeaderboardTableProps {
  voterAccounts: VoterAccount[];
  offset: number;
  isFetching: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  voterAccounts,
  offset,
  isFetching,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();

  // Format voters to rows
  const rows = useMemo(
    () =>
      voterAccounts.map((voter, idx) => ({
        rank: {
          value: idx + 1 + offset,
          voterAddress: voter.address,
        },
        votes: {
          value: voter.votesWei.toFixed(),
          align: 'right' as TableAlign,
        },
        voteWeight: {
          value: voter.voteWeightPercent,
          align: 'right' as TableAlign,
        },
        proposalsVoted: {
          value: voter.proposalsVoted,
          align: 'right' as TableAlign,
        },
      })),
    [JSON.stringify(voterAccounts)],
  );

  const columns: TableColumnProps<typeof rows[number]>[] = [
    {
      key: 'rank',
      label: t('voterLeaderboard.columns.rank'),
      orderable: false,
      align: 'left' as TableAlign,
    },
    {
      key: 'votes',
      label: t('voterLeaderboard.columns.votes'),
      orderable: false,
      align: 'right' as TableAlign,
    },
    {
      key: 'voteWeight',
      label: t('voterLeaderboard.columns.voteWeight'),
      orderable: false,
      align: 'right' as TableAlign,
    },
    {
      key: 'proposalsVoted',
      label: t('voterLeaderboard.columns.proposalsVoted'),
      orderable: false,
      align: 'right' as TableAlign,
    },
  ];

  const cardColumns = useMemo(() => {
    const newColumns = [...columns];
    newColumns[2].align = 'center';
    newColumns[3].align = 'left';

    return newColumns;
  }, [columns]);

  const renderCell = ({
    row,
    columnKey,
  }: {
    row: typeof rows[number];
    columnKey: keyof typeof rows[number];
  }) => {
    if (columnKey === 'rank') {
      return (
        <Typography css={styles.inline} color="textPrimary" variant="small2">
          {row.rank.value}
          <Link
            to={Path.GOVERNANCE_ADDRESS.replace(':address', row.rank.voterAddress)}
            css={styles.address}
          >
            <EllipseAddress address={row.rank.voterAddress} ellipseBreakpoint="lg" />
          </Link>
        </Typography>
      );
    }

    if (columnKey === 'votes') {
      return (
        <Typography color="textPrimary" variant="small2">
          {convertWeiToTokens({
            valueWei: new BigNumber(row.votes.value),
            tokenId: 'xvs',
            returnInReadableFormat: true,
            addSymbol: false,
            minimizeDecimals: true,
          })}
        </Typography>
      );
    }

    if (columnKey === 'voteWeight') {
      return (
        <Typography color="textPrimary" variant="small2">
          {formatToReadablePercentage(row.voteWeight.value)}
        </Typography>
      );
    }

    if (columnKey === 'proposalsVoted') {
      return (
        <Typography color="textPrimary" variant="small2">
          {row.proposalsVoted.value}
        </Typography>
      );
    }
  };

  return (
    <Table
      title={t('voterLeaderboard.addressesByVotingWeight')}
      data={rows}
      columns={columns}
      cardColumns={cardColumns}
      renderCell={renderCell}
      keyExtractor={row => `voter-leaderboard-table-row-${row.rank.voterAddress}`}
      isFetching={isFetching}
      initialOrder={{
        orderBy: 'rank',
        orderDirection: 'asc',
      }}
      tableCss={styles.table}
      cardsCss={styles.cards}
      css={styles.cardContentGrid}
    />
  );
};

export default LeaderboardTable;
