/** @jsxImportSource @emotion/react */
import { Modal, ModalProps, Spinner, TabContent, Tabs, Token } from 'components';
import React from 'react';
import { useTranslation } from 'translation';
import { UserAsset } from 'types';
import { isAssetEnabled } from 'utilities';

import { useGetUserAssets } from 'clients/api';
import { AuthContext } from 'context/AuthContext';

import Borrow from './Borrow';
import Repay from './Repay';
import { useStyles } from './styles';

export interface BorrowRepayProps {
  onClose: ModalProps['handleClose'];
  includeXvs: boolean;
  assetId: UserAsset['id'];
}

const BorrowRepay: React.FC<BorrowRepayProps> = ({ onClose, assetId, includeXvs }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { account } = React.useContext(AuthContext);

  const {
    data: { assets },
  } = useGetUserAssets({
    accountAddress: account?.address,
  });

  const asset = React.useMemo(
    () => assets.find(marketAsset => marketAsset.id === assetId),
    [assetId, JSON.stringify(assets)],
  );

  const tabsContent: TabContent[] = [
    {
      title: t('borrowRepayModal.repayTabTitle'),
      content: (
        <div css={styles.container}>
          {asset ? <Repay asset={asset} onClose={onClose} includeXvs={includeXvs} /> : <Spinner />}
        </div>
      ),
    },
  ];

  if (asset && isAssetEnabled(asset.id)) {
    tabsContent.unshift({
      title: t('borrowRepayModal.borrowTabTitle'),
      content: (
        <div css={styles.container}>
          {asset ? <Borrow asset={asset} onClose={onClose} includeXvs={includeXvs} /> : <Spinner />}
        </div>
      ),
    });
  }

  return (
    <Modal isOpen title={<Token tokenId={assetId} variant="h4" />} handleClose={onClose}>
      <Tabs tabsContent={tabsContent} />
    </Modal>
  );
};

export default BorrowRepay;
