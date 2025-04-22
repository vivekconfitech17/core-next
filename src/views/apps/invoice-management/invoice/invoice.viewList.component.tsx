
import React from 'react';

import { TabView, TabPanel } from 'primereact/tabview';

import FundInvoiceListComponent from './fundInvoice.list.component';
import InvoiceListComponent from './invoice.list.component';
import QuotationToBeInvoicedListComponent from './quotation.to.be.invoiced.list';
import InvoiceDashboard from './InvoiceDashboard';

const ProductComponent = () => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <TabView scrollable  style={{ fontSize: '14px' }} activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
       <TabPanel leftIcon="pi pi-bolt mr-2" header="Overview">
        <InvoiceDashboard />
      </TabPanel>
      <TabPanel leftIcon="pi pi-bolt mr-2" header="Quotations To Be Invoiced">
        <QuotationToBeInvoicedListComponent />
      </TabPanel>
      <TabPanel leftIcon="pi pi-bolt mr-2" header="Invoice">
        <InvoiceListComponent />
      </TabPanel>
      <TabPanel leftIcon="pi pi-history mr-2" header="Fund Invoice">
        <FundInvoiceListComponent />
      </TabPanel>
    </TabView>
  );
}


export default ProductComponent
