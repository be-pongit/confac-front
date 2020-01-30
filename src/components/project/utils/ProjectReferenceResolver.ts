import moment from 'moment';
import {ProjectModel, FullProjectModel, ProjectClientModel} from '../models/ProjectModel';
import {ConsultantModel} from '../../consultant/models/ConsultantModel';
import {ClientModel} from '../../client/models/ClientModels';

export class ProjectReferenceResolver {
  private projects: ProjectModel[]
  private consultants: ConsultantModel[]
  private clients: ClientModel[]

  constructor(projects: ProjectModel[], consultants: ConsultantModel[], clients: ClientModel[]) {
    this.projects = projects;
    this.consultants = consultants;
    this.clients = clients;
  }

  getConsultant(consultantId: string): ConsultantModel {
    return this.consultants.find(consultant => consultant._id === consultantId) as ConsultantModel;
  }

  getClient(client: ProjectClientModel | undefined): ClientModel | undefined {
    if (!client) {
      return undefined;
    }
    return this.clients.find(c => c._id === client.clientId) || undefined;
  }

  getIsProjectActive(startDate: moment.Moment, endDate?: moment.Moment): boolean {
    if (endDate) {
      return moment().isBetween(startDate, endDate);
    }

    return moment().isAfter(startDate);
  }

  getProjects(): FullProjectModel[] {
    return this.projects.map(project => ({
      _id: project._id,
      details: {...project, active: this.getIsProjectActive(project.startDate, project.endDate)},
      consultant: this.getConsultant(project.consultantId),
      client: this.getClient(project.client) as ClientModel,
      partner: this.getClient(project.partner),
    }));
  }
}
