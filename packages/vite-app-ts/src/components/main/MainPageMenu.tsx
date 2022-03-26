import { Menu } from 'antd';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';

export interface IMainPageMenuProps {
  route: string;
  setRoute: React.Dispatch<React.SetStateAction<string>>;
}

export const MainPageMenu: FC<IMainPageMenuProps> = (props) => (
  <Menu
    style={{
      textAlign: 'center',
    }}
    selectedKeys={[props.route]}
    mode="horizontal">
    <Menu.Item key="/">
      <Link
        onClick={(): void => {
          props.setRoute('/');
        }}
        to="/">
        Availabe pools
      </Link>
    </Menu.Item>
    <Menu.Item key="/user-pool">
      <Link
        onClick={(): void => {
          props.setRoute('/user-pool');
        }}
        to="/user-pools">
        Your Pools
      </Link>
    </Menu.Item>
  </Menu>
);
