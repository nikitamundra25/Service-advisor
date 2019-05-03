import React, { Component } from "react";
import { Button, UncontrolledTooltip } from "reactstrap";
import XLSX from "xlsx";
import { CustomerSheetData } from "../../config/DummySheetData";

export const DemoSupportedSheets = {
  CUSTOMER: "customer",
  VEHICLE: "vehicle"
};

class CrmExportSampleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  downloadSampleFile = e => {
    e.preventDefault();
    let data = [];
    let header = [];
    const { sheetType } = this.props;
    switch (sheetType) {
      case DemoSupportedSheets.CUSTOMER:
        data = CustomerSheetData.data;
        header = CustomerSheetData.header;
        break;

      default:
        break;
    }
    const ws = XLSX.utils.json_to_sheet(data, {
      header
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Customers Sheet 1`);
    /* generate XLSX file and send to client */
    XLSX.writeFile(wb, `${sheetType || "sheet"}_sample_${Date.now()}.xlsx`);
  };
  render() {
    return (
      <>
        <Button onClick={this.downloadSampleFile} id={"download-sample"}>
          Download Sample
        </Button>{" "}
        <UncontrolledTooltip target={"download-sample"}>
          Download Sample
        </UncontrolledTooltip>
      </>
    );
  }
}

export default CrmExportSampleButton;
