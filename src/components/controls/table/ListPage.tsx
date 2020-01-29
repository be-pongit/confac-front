import React from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import {IFeature} from '../feature/feature-models';
import {t} from '../../utils';
import {List} from './List';
import {Button} from '../form-controls/Button';
import {SearchStringInput} from '../form-controls/inputs/SearchStringInput';
import {Switch} from '../form-controls/Switch';
import {ListFilters} from './table-models';

type ListPageProps = {
  feature: IFeature<any, any>;
  /** Renders at the title level */
  topToolbar?: any;
}


export const ListPage = ({feature, topToolbar}: ListPageProps) => (
  <Container className="list">
    <Row>
      <Col sm={6}>
        <h1>{t(feature.trans.listTitle)}</h1>
      </Col>
      <Col sm={6} className="list-top-toolbar">
        {topToolbar}
      </Col>
      <Col lg={3} md={3}>
        <Button variant="light" onClick={feature.nav('create')} icon="fa fa-plus" size="md">
          {t(feature.trans.createNew)}
        </Button>
      </Col>
      <ListPageFilters feature={feature} />
    </Row>

    <List feature={feature} />
  </Container>
);



const ListPageFilters = ({feature}: {feature: IFeature<any, ListFilters>}) => {
  const components: React.ReactNode[] = [];

  const {filter} = feature.list;
  if (filter) {
    if (filter.fullTextSearch) {
      components.push(
        <SearchStringInput
          value={filter.state.freeText}
          onChange={str => filter.updateFilter({...filter.state, freeText: str})}
        />,
      );
    }

    if (filter.extras) {
      components.push(filter.extras());
    }

    if (filter.softDelete) {
      components.push(
        <Switch
          value={filter.state.showInactive}
          onChange={(checked: boolean) => filter.updateFilter({...filter.state, showInactive: checked})}
          label={t('feature.showInactive')}
          onColor="#F2DEDE"
        />,
      );
    }
  }

  return (
    <>
      {components.map((c, i) => <Col lg={3} md={6} key={i}>{c}</Col>)}
    </>
  );
};