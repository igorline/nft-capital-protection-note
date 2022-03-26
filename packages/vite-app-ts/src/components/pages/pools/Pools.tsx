/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { StaticJsonRpcProvider } from '@ethersproject/providers';
import { formatEther, parseEther } from '@ethersproject/units';
import { Button, Divider, Input, List, Table } from 'antd';
import { Address, Balance } from 'eth-components/ant';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { useContractReader, useEventListener, useGasPrice } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { BigNumber } from 'ethers';
import React, { useState, FC, useContext, ReactNode } from 'react';

import { useAppContracts } from '~~/config/contractContext';
import { SetPurposeEvent } from '~~/generated/contract-types/YourContract';

export interface IAvailablePoolsProps {
  pools: any;
  treasuryInfo: any;
  stakers: Array<any>;
}

const farmHeaders = [ 'Name', 'Protocol', 'Base Apy', 'Reward Apy', 'Tvl' ];

export const AvailablePools: FC<IAvailablePoolsProps> = (props) => {
  const { pools, treasuryInfo, stakers } = props;
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: 40 }}>Stake and Invest</h1>
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'baseline',
              border: '1px solid #cccccc',
              borderRadius: 10,
              padding: 10,
              margin: 'auto',
              marginBottom: 20,
            }}>
            <h1 style={{ fontSize: 25 }}>{treasuryInfo.name}</h1>
            <div>
              <span style={{ paddingRight: 15 }}>Target: {`${treasuryInfo.target} ${treasuryInfo.token}`}</span>
              <span>Tokens: {treasuryInfo.token}</span>
            </div>
            <div>
              <span style={{ paddingRight: 15 }}>Creator: {treasuryInfo.creator}</span>
              <span>Pool ratio: {treasuryInfo.poolRatio}/10</span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'baseline',
              border: '1px solid #cccccc',
              borderRadius: 10,
              padding: 10,
              margin: 'auto',
            }}>
            <h1 style={{ fontSize: 25 }}>Farms</h1>
            {/* <Table
              dataSource={pools.map((pool: any) => ({
                key: pool.underlying.contract_address,
                Name: pool.underlying.contract_ticker_symbol,
              }))}
            /> */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {farmHeaders.map((header: any) => (
                <h1 key={header} style={{ fontSize: 20, color: 'GrayText', marginRight: 10 }}>
                  {header}
                </h1>
              ))}
            </div>
            {pools.map((pool: any) => (
              <div key={pool.underlying.contract_address}>
                <h1>{pool.underlying.contract_ticker_symbol}</h1>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: 40 }}>Stakers</h1>
        {stakers.map((staker: any) => (
          <div style={{ border: '1px solid #cccccc', padding: 5, margin: 'auto', marginTop: 5 }} key={staker}>
            <span>{staker.substring(0, 20)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
};
