import React, { useCallback, useContext, useState } from 'react';
import { UserMarket } from 'types';

import { IncludeXvsContext } from 'context/IncludeXvsContext';

import Modal from './Modal';

const useBorrowRepayModal = () => {
  const { includeXvs } = useContext(IncludeXvsContext);
  const [selectedAssetId, setSelectedAssetId] = useState<undefined | UserMarket['id']>();

  const BorrowRepayModal: React.FC = useCallback(() => {
    if (!selectedAssetId) {
      return <></>;
    }

    return (
      <Modal
        assetId={selectedAssetId}
        onClose={() => setSelectedAssetId(undefined)}
        includeXvs={includeXvs}
      />
    );
  }, [selectedAssetId]);

  return {
    openBorrowRepayModal: (assetId: UserMarket['id']) => setSelectedAssetId(assetId),
    closeBorrowRepayModal: () => setSelectedAssetId(undefined),
    BorrowRepayModal,
  };
};

export default useBorrowRepayModal;
