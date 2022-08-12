/** @jsxImportSource @emotion/react */
import { Typography } from '@mui/material';
import { Icon } from 'components';
import React from 'react';
import { useTranslation } from 'translation';
import { VoteDetailTransaction } from 'types';

import { useStyles } from './styles';

interface ActionCellProps {
  voterAddress: string;
  transaction: VoteDetailTransaction;
}

const ActionCell: React.FC<ActionCellProps> = ({ voterAddress, transaction }) => {
  const styles = useStyles();
  const { t } = useTranslation();

  let content = <></>;

  if (transaction.type === 'transfer') {
    content =
      transaction.to.toLowerCase() === voterAddress.toLowerCase() ? (
        <>
          <Icon name="arrowShaft" css={styles.received} />

          {t('voterDetail.receivedXvs')}
        </>
      ) : (
        <>
          <Icon name="arrowShaft" css={styles.sent} />

          {t('voterDetail.sentXvs')}
        </>
      );
  } else if (transaction.type === 'vote') {
    switch (transaction.support) {
      case 'AGAINST':
        content = (
          <>
            <div css={[styles.icon, styles.against]}>
              <Icon name="close" />
            </div>

            {t('voterDetail.votedAgainst')}
          </>
        );
        break;
      case 'FOR':
        content = (
          <>
            <div css={[styles.icon, styles.for]}>
              <Icon name="mark" />
            </div>

            {t('voterDetail.votedFor')}
          </>
        );
        break;
      case 'ABSTAIN':
        content = (
          <>
            <div css={[styles.icon, styles.abstain]}>
              <Icon name="dots" />
            </div>

            {t('voterDetail.votedAbstain')}
          </>
        );
        break;
      // no default
    }
  }

  return (
    <Typography css={styles.action} variant="small2" color="textPrimary">
      {content}
    </Typography>
  );
};

export default ActionCell;
