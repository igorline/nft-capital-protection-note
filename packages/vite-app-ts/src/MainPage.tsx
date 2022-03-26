/* eslint-disable @typescript-eslint/no-unsafe-return */
import React, { FC, useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useQuery } from 'react-query';

import '~~/styles/main-page.css';

import { GenericContract } from 'eth-components/ant/generic-contract';
import { useContractReader, useBalance, useEthersAdaptorFromProviderOrSigners, useEventListener } from 'eth-hooks';
import { useEthersContext } from 'eth-hooks/context';
import { useDexEthPrice } from 'eth-hooks/dapps';
import { asEthersAdaptor } from 'eth-hooks/functions';

import { MainPageMenu, MainPageFooter, MainPageHeader } from './components/main';
import { useScaffoldHooksExamples as useScaffoldHooksExamples } from './components/main/hooks/useScaffoldHooksExamples';

import { useBurnerFallback } from '~~/components/main/hooks/useBurnerFallback';
import { useScaffoldProviders as useScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { AvailablePools, UserPools } from '~~/components/pages';
import { BURNER_FALLBACK_ENABLED, MAINNET_PROVIDER } from '~~/config/appConfig';
import { useAppContracts, useConnectAppContracts, useLoadAppContracts } from '~~/config/contractContext';
import { NETWORKS } from '~~/models/constants/networks';
import axios, { AxiosResponse} from 'axios';

const AVAILABLE_POOLS_URL: string = 'https://api.covalenthq.com/v1/43114/networks/aave_v2/assets/?quote-currency=USD&format=JSON&key=ckey_d08af29fee2e462481eeeaeaa6e';

const fetchAvailbalePools = async (): Promise<any> => {
  try {
    const res: AxiosResponse = await axios.get(AVAILABLE_POOLS_URL);
    console.log(res);
    const data = res.data?.data?.items;
    if (!data) return [];
    return data;
  } catch (error: any) {
    console.log(error.message);
    return [];
  }
}

const stakers = [
  '0x6277f8858a2c8f8c9ba401467aa67c7d5f5e1388',
  '0x56ca47e8e19a5b710bd7ee047081a928e618875e',
  '0xcdf4cde193c46093941326ab83e589e0efa18475',
  '0xdfcb37fd793853aec7218ff01d3d0aec060a6708',
  '0x3d954afcf9c9b0caa74711fab6749cc1dede0ae5',
  '0x7c5cc15e262dbbcf483b7bdcee262f9051c195b4',
  '0x82bf72fc64188b491ee750d5b16adf530bd52a10',
  '0x2dafe8b194cc3ab3c1a72226db3fbfc51df30f0d',
];

const treasuryInfo = {
  name: 'ToroDao Genesis',
  token: 'DAI.e',
  target: 100000,
  creator: 'garylatta.eth',
  poolRatio: 90,
  completition: 48,
};

export const Main: FC = () => {
  const scaffoldAppProviders = useScaffoldAppProviders();
  const ethersContext = useEthersContext();
  useBurnerFallback(scaffoldAppProviders, BURNER_FALLBACK_ENABLED);
  useLoadAppContracts();
  const [mainnetAdaptor] = useEthersAdaptorFromProviderOrSigners(MAINNET_PROVIDER);
  useConnectAppContracts(mainnetAdaptor);
  useConnectAppContracts(asEthersAdaptor(ethersContext));
  useScaffoldHooksExamples(scaffoldAppProviders);
  const yourContract = useAppContracts('YourContract', ethersContext.chainId);
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);

  const [purpose, update] = useContractReader(
    yourContract,
    yourContract?.purpose,
    [],
    yourContract?.filters.SetPurpose()
  );
  const [ethPrice] = useDexEthPrice(scaffoldAppProviders.mainnetAdaptor?.provider, scaffoldAppProviders.targetNetwork);

  const [yourCurrentBalance] = useBalance(ethersContext.account);

  const [route, setRoute] = useState<string>('');
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const { data: availablePools } = useQuery(['available-pools'], () => fetchAvailbalePools(), {
    enabled: true,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="App">
      <MainPageHeader scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} />
      <BrowserRouter>
        <MainPageMenu route={route} setRoute={setRoute} />
        <Switch>
          <Route exact path="/">
            <AvailablePools pools={availablePools || []} stakers={stakers} treasuryInfo={treasuryInfo}/>
          </Route>
          <Route exact path="/user-pools">
            <UserPools />
          </Route>
        </Switch>
      </BrowserRouter>
      {/* <MainPageFooter scaffoldAppProviders={scaffoldAppProviders} price={ethPrice} /> */}
    </div>
  );
};
