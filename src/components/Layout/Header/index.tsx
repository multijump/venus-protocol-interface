/** @jsxImportSource @emotion/react */
import AppBar from '@mui/material/AppBar';
import React from 'react';

import ClaimXvsRewardButton from '../ClaimXvsRewardButton';
import ConnectButton from '../ConnectButton';
import { Toolbar } from '../Toolbar';
import Breadcrumbs from './Breadcrumbs';
import { useStyles } from './styles';

const Header: React.FC = () => {
  const styles = useStyles();

  return (
    <AppBar position="relative" css={styles.appBar}>
      <Toolbar css={styles.toolbar}>
        <Breadcrumbs />

        <div css={styles.ctaContainer}>
          <ClaimXvsRewardButton css={styles.claimXvsButton} />
          <ConnectButton />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
