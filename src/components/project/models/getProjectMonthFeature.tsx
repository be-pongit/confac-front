/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';
import {IList, IListCell, ProjectMonthListFilters} from '../../controls/table/table-models';
import {Features, IFeature, IFeatureBuilderConfig} from '../../controls/feature/feature-models';
import {features} from '../../../trans';
import {FullProjectMonthModel} from './FullProjectMonthModel';
import {t, searchinize} from '../../utils';
import {ProjectMonthTimesheetCell} from '../project-month-list/ProjectMonthTimesheetCell';
import {ProjectMonthConsultantCell} from '../project-month-list/ProjectMonthConsultantCell';
import {ProjectMonthInboundCell} from '../project-month-list/ProjectMonthInboundCell';
import {ProjectMonthOutboundCell} from '../project-month-list/ProjectMonthOutboundCell';
import {getInvoiceDueDateVariant} from '../../invoice/invoice-table/getInvoiceListRowClass';
import {ProjectMonthNotesCell} from '../project-month-list/ProjectMonthNotesCell';
import {ConsultantCountFooter, ProjectForecastPartnerFooter, ProjectClientForecastFooter} from '../project-month-list/ProjectMonthFooters';


export type ProjectMonthFeatureBuilderConfig = IFeatureBuilderConfig<FullProjectMonthModel, ProjectMonthListFilters>;



const fullProjectSearch = (filters: ProjectMonthListFilters, prj: FullProjectMonthModel) => {
  if (!filters.freeText) {
    return true;
  }

  const {details, consultant, client, partner} = prj;

  const freeText = filters.freeText.trim().toLowerCase();
  if (prj.project.client.ref && prj.project.client.ref.toLowerCase().includes(freeText)) {
    return true;
  }

  if (prj.project.partner && prj.project.partner.ref && prj.project.partner.ref.toLowerCase().includes(freeText)) {
    return true;
  }

  if (prj.details.orderNr && prj.details.orderNr.includes(freeText)) {
    return true;
  }

  return searchinize(
    `${details.month.format('MMMM YYYY')} ${consultant.firstName} ${consultant.name} ${client.name} ${partner && partner.name}`,
  ).includes(freeText);
};





const projectListConfig = (config: ProjectMonthFeatureBuilderConfig): IList<FullProjectMonthModel, ProjectMonthListFilters> => {
  const list: IListCell<FullProjectMonthModel>[] = [{
    key: 'project',
    value: p => <ProjectMonthConsultantCell fullProjectMonth={p} />,
    className: p => {
      if (p.details.verified) {
        return 'validated';
      }
      return undefined;
    },
    footer: models => {
      const consultants = models.map(x => x.consultant);
      if (!consultants.length) {
        return null;
      }
      return <ConsultantCountFooter consultants={consultants} month={models[0].details.month} />;
    },
  }, {
    key: 'timesheet',
    value: p => <ProjectMonthTimesheetCell fullProjectMonth={p} />,
    className: p => {
      if (p.details.timesheet.validated) {
        return 'validated';
      }
      return undefined;
    },
  }, {
    key: 'inbound',
    value: p => <ProjectMonthInboundCell fullProjectMonth={p} />,
    className: p => {
      if (!p.project.projectMonthConfig.inboundInvoice || p.details.inbound.status === 'paid' || p.details.verified === 'forced') {
        return 'validated';
      }

      switch (p.details.inbound.status) {
        case 'validated':
          return 'table-warning';
        case 'new':
        default:
          return undefined;
      }
    },
    footer: (models: FullProjectMonthModel[]) => {
      if (!models.length) {
        return null;
      }
      return <ProjectForecastPartnerFooter models={models} month={models[0].details.month} />;
    },
  }, {
    key: 'outbound',
    value: p => <ProjectMonthOutboundCell fullProjectMonth={p} />,
    className: p => {
      if (p.invoice) {
        if (p.invoice.verified) {
          return 'validated';
        }
        return `table-${getInvoiceDueDateVariant(p.invoice)}`;
      }
      return undefined;
    },
    footer: (models: FullProjectMonthModel[]) => {
      if (!models.length) {
        return null;
      }
      return <ProjectClientForecastFooter models={models} month={models[0].details.month} />;
    },
  }, {
    key: 'notes',
    value: p => <ProjectMonthNotesCell fullProjectMonth={p} />,
    className: p => {
      if (p.details.verified) {
        return 'validated';
      }
      return undefined;
    },
  }];

  return {
    rows: {
      cells: list,
    },
    listTitle: () => t('project.projectMonthConfig.titleConfig'),
    data: config.data,
    sorter: (a, b) => `${a.client.name} ${a.consultant.firstName} ${a.consultant.name}`
      .localeCompare(`${b.client.name} ${b.consultant.firstName} ${b.consultant.name}`),
  };
};


export const projectMonthFeature = (config: ProjectMonthFeatureBuilderConfig): IFeature<FullProjectMonthModel, ProjectMonthListFilters> => {
  const feature: IFeature<FullProjectMonthModel, ProjectMonthListFilters> = {
    key: Features.projectMonths,
    nav: m => `/projects/${m === 'create' ? m : m.details.month.format('YYYY/MM')}`,
    trans: features.projectMonth as any,
    list: projectListConfig(config),
  };

  feature.list.filter = {
    state: config.filters,
    updateFilter: config.setFilters,
    fullTextSearch: fullProjectSearch,
    softDelete: false,
  };

  return feature;
};
