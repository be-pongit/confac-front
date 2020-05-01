import moment from 'moment';
import {getNewClient} from '../../client/models/getNewClient';
import InvoiceModel, {calculateDaysWorked} from '../models/InvoiceModel';
import {defaultConfig} from '../../config/models/getNewConfig';
import {ConfigModel} from '../../config/models/ConfigModel';
import {ClientModel} from '../../client/models/ClientModels';

// const defaultHoursInDay = 8;

function createNew(config: ConfigModel, client: undefined | ClientModel): InvoiceModel {
  let model = new InvoiceModel(config, {
    client,
    number: 1,
    fileName: client ? client.invoiceFileName : '',
  });
  model = model.setClient(client);
  return model;
}


function createViewModel() {
  const client = getNewClient(defaultConfig);
  const vm = createNew(defaultConfig, client);
  vm.date = moment('2017-02-01'); // has 20 working days
  return vm;
}

describe('calculating money (taxes and totals)', () => {
  it('should have a total of 0 for no invoice lines', () => {
    const vm = createViewModel();
    expect(vm.money.total).toBe(0);
  });


  it('should ignore "section" lines', () => {
    const vm = createViewModel();
    vm.addLine({type: 'section', amount: 1, tax: 21, price: 500, desc: '', sort: 0});
    expect(vm.money.total).toEqual(0);
  });


  it('should have correct money values for daily/hourly invoice lines mixed', () => {
    const vm = createViewModel();
    vm.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});
    vm.addLine({type: 'hourly', amount: 1, tax: 21, price: 500, desc: '', sort: 0});

    expect(vm.money).toEqual({
      totalWithoutTax: 1000,
      totalTax: 210,
      discount: 0,
      total: 1210,
      totals: jasmine.any(Object),
    });
  });


  describe('discounts', () => {
    it('should use a fixed amount when the discount is a number', () => {
      const vm = createViewModel();
      vm.discount = '200';
      vm.addLine({type: 'daily', amount: 1, tax: 10, price: 500, desc: '', sort: 0});

      expect(vm.money).toEqual({
        totalWithoutTax: 500,
        totalTax: 50,
        discount: 200,
        total: 350,
        totals: jasmine.any(Object),
      });
    });

    it('should use a percentage when the discount ends with the % sign', () => {
      const vm = createViewModel();
      vm.discount = '10%';
      vm.addLine({type: 'daily', amount: 1, tax: 10, price: 500, desc: '', sort: 0});

      expect(vm.money).toEqual({
        totalWithoutTax: 500,
        totalTax: 50,
        discount: '10%',
        total: 495,
        totals: jasmine.any(Object),
      });
    });
  });


  describe('totals per line.type', () => {
    it('should calculate total without tax for each line.type', () => {
      const vm = createViewModel();
      vm.addLine({type: 'daily', amount: 1, tax: 0, price: 500, desc: '', sort: 0});
      vm.addLine({type: 'hourly', amount: 2, tax: 10, price: 500, desc: '', sort: 0});

      expect(vm.money.totals).toEqual({
        daily: 500,
        hourly: 1000,
      });
    });
  });
});



describe('calculating days worked', () => {
  it('calcs 2 hourly lines correctly', () => {
    const vm = createViewModel();
    vm.addLine({type: 'hourly', amount: 8, tax: 21, price: 500, desc: '', sort: 0});
    vm.addLine({type: 'hourly', amount: 8, tax: 21, price: 500, desc: '', sort: 0});
    const result = calculateDaysWorked([vm]);

    expect(result).toEqual({
      daysWorked: 2,
      workDaysInMonth: 20,
      hoursWorked: 16,
    });
  });

  it('calcs 2 daily lines correctly', () => {
    const vm = createViewModel();
    vm.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});
    vm.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});
    const result = calculateDaysWorked([vm]);

    expect(result).toEqual({
      daysWorked: 2,
      workDaysInMonth: 20,
      hoursWorked: 16,
    });
  });

  it('calcs days and hours mixed correctly', () => {
    const vm = createViewModel();
    vm.addLine({type: 'hourly', amount: 8, tax: 21, price: 500, desc: '', sort: 0});
    vm.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});
    const result = calculateDaysWorked([vm]);

    expect(result).toEqual({
      daysWorked: 2,
      workDaysInMonth: 20,
      hoursWorked: 16,
    });
  });

  it('calcs workDaysInMonth for multiple invoices in same month correctly', () => {
    const vm = createViewModel();
    vm.date = moment('2017-02-01'); // has 20 working days
    vm.addLine({type: 'hourly', amount: 8, tax: 21, price: 500, desc: '', sort: 0});

    const vm2 = createViewModel();
    vm.date = moment('2017-02-01');
    vm2.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});

    const vm3 = createViewModel();
    vm.date = moment('2017-01-01'); // has 22 working days
    vm2.addLine({type: 'daily', amount: 1, tax: 21, price: 500, desc: '', sort: 0});


    const result = calculateDaysWorked([vm, vm2, vm3]);


    expect(result.workDaysInMonth).toBe(20 + 22);
  });
});


describe('Switch between days and hours', () => {
  it('Fixes price & amount when switching from daily to hourly', () => {
    const vm = createViewModel();
    vm.updateLine(0, {type: 'daily', amount: 1, price: 800});

    vm.updateLine(0, {type: 'hourly'});

    expect(vm.lines[0].type).toBe('hourly');
    expect(vm.lines[0].price).toBe(100);
    expect(vm.lines[0].amount).toBe(8);
  });

  it('Fixes price & amount when switching from hourly to daily', () => {
    const vm = createViewModel();
    vm.updateLine(0, {type: 'hourly'});
    vm.updateLine(0, {amount: 8, price: 100});

    vm.updateLine(0, {type: 'daily'});

    expect(vm.lines[0].type).toBe('daily');
    expect(vm.lines[0].price).toBe(800);
    expect(vm.lines[0].amount).toBe(1);
  });

  it('Takes the client rate.hoursInDay into account', () => {
    const vm = createViewModel();
    vm.client.rate.hoursInDay = 10;
    vm.updateLine(0, {type: 'daily', amount: 1});

    vm.updateLine(0, {type: 'hourly'});

    expect(vm.lines[0].amount).toBe(10);
  });
});
