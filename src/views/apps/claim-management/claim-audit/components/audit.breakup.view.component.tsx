import React, { useState } from 'react';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';

const BreakUpComponents = ({ rowData, providerList, data }:{ rowData:any, providerList:any, data:any }) => {
  const [expandedRows, setExpandedRows] = useState<any>(null);

  const expandAll = () => {
    const _expandedRows:any = {};

    rowData.invoices.forEach((p:any) => (_expandedRows[`${p.id}`] = true));

    setExpandedRows(_expandedRows);
  };

  const collapseAll = () => {
    setExpandedRows(null);
  };

  const allowExpansion =  (rowData:any) => {
    return rowData?.invoiceItems?.length > 0;
  };

  const header = (
    <div className="flex flex-wrap justify-content-end gap-2">
      <Button icon="pi pi-plus" label="Expand All" onClick={expandAll} text />
      <Button icon="pi pi-minus" label="Collapse All" onClick={collapseAll} text />
    </div>
  );

  const rowExpansionTemplate = (data:any) => {
    return (
      <div style={{ padding: '18px' }}>
        <h5>invoices for {providerList?.find((provider:any) => data.provideId == provider.id)?.providerBasicDetails.name}</h5>
        <DataTable value={data.invoiceItems}>
          <Column field="expenseHeadName" header="Head" sortable></Column>
          <Column field="rateKes" header="Rate KSH" sortable></Column>
          <Column field="unit" header="Unit" sortable></Column>
          <Column field="totalKes" header="Total KSH" sortable></Column>
        </DataTable>
      </div>
    );
  };

  return (
    <>
      <DataTable
        value={rowData.invoices}
        expandedRows={expandedRows}
        onRowToggle={(e:any) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="invoiceNo"
        tableStyle={{ minWidth: '4+0rem' }}>
        <Column expander={allowExpansion} style={{ width: '4rem' }} />
        <Column field="serial" header="SL#" body={(rowData, data) => data.rowIndex + 1} style={{ width: '4rem' }} />
        <Column field="invoiceNo" header="Invoice No" sortable />
        <Column
          field="provideId"
          header="Provider"
          sortable
          body={rowData => providerList?.find((provider:any) => rowData.provideId == provider.id)?.providerBasicDetails.name}
        />
        <Column field="invoiceAmount" header="Claim Amt" sortable />
        <Column field="admAmt" header="Adm Amt" sortable />
        <Column field="payee" header="Payee" sortable />
        <Column field="reason" header="Reason" sortable />
        <Column field="decision" header="Decision" sortable />
      </DataTable>
    </>
  );
};

export default BreakUpComponents;
