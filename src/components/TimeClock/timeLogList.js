import React, { Component } from "react";
import {
  Col,
  Input,
  FormGroup,
  InputGroup,
  Row,
  Button,
  UncontrolledTooltip,
  Form,
  Label,
  Table,
  Card
} from "reactstrap";
import NoDataFound from "../common/NoFound"
import { AppConfig } from "../../config/AppConfig";
import moment from "moment";
import { CrmTimeClockModal } from "../common/CrmTimeClockModel";
import { calculateDurationFromSeconds } from "../../helpers/Sum"
import { ConfirmBox } from "../../helpers/SweetAlert";
import Dollor from "../common/Dollor"
import Loader from "../../containers/Loader/Loader";
import PaginationHelper from "../../helpers/Pagination";
import * as qs from "query-string";

class TimeLogList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      timeLogEle: "",
      search: "",
      sort: ""
    };
  }
  componentDidMount() {
    const { location } = this.props;
    const lSearch = location.search;
    const { page, search, sort } = qs.parse(lSearch);
    let filterApplied = false;
    if (search || sort) {
      filterApplied = true;
    }
    this.setState({
      page: parseInt(page) || 1,
      sort: sort || "",
      search: search || "",
      filterApplied
    })
  }
  handleEditTimeClockModal = (timeLogs) => {
    const { modelInfoReducer, modelOperate } = this.props;
    const { modelDetails } = modelInfoReducer;
    const { timeClockEditModalOpen } = modelDetails;
    this.setState({
      timeLogEle: timeLogs
    })
    modelOperate({
      timeClockEditModalOpen: !timeClockEditModalOpen
    });
  };
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    })
  }
  /* 
  /*
  */
  onSearch = e => {
    e.preventDefault();
    this.setState({
      page: 1,
    });
    const { search, sort } = this.state;
    const query = {
      page: 1,
      search,
      sort
    };
    this.setState({
      filterApplied: true,
      page: 1
    });
    const { location } = this.props;
    const { pathname } = location;
    this.props.redirectTo([pathname, qs.stringify(query)].join("?"))
  };
  /* 
  /*
  */
  onReset = e => {
    e.preventDefault();
    this.setState({
      page: 1,
      search: "",
      filterApplied: false
    });
    const { location } = this.props;
    const { pathname } = location;
    this.props.redirectTo(`${pathname}`);
  };
  /* 
  /*
  */
  handleTimeLogdelete = async (timeLogId, orderId) => {
    const { value } = await ConfirmBox({
      text: "You want to delete this time log?"
    });
    if (!value) {
      return;
    }
    const paylod = {
      isDeleted: true,
      orderId: orderId ? orderId : null,
      _id: timeLogId,
      isTimerClock: true
    }
    this.props.editTimeLogRequest(paylod)
  }
  /* 
  */
  onPageChange = page => {
    const { location } = this.props;
    const { search, pathname } = location;
    const query = qs.parse(search);
    this.props.redirectTo(
      [pathname, qs.stringify({ ...query, page })].join('?')
    );
  };

  render() {
    const {
      timeLogData,
      handleTimeClockModal,
      getUserData,
      orderReducer,
      editTimeLogRequest,
      modelInfoReducer,
      totalDuration,
      totalTimeLogs,
      isSuccess } = this.props;
    const { modelDetails } = modelInfoReducer;
    const { timeClockEditModalOpen } = modelDetails;
    const { page, timeLogEle, search, sort } = this.state
    return (
      <div>
        <div className={""}>
          <Row>
            <Col md={"3"}>
              <Card className={"p-3"}>
                <div className={"d-flex"}>
                  <div className={"pt-2"}>
                    <div className={"time-clock-icon"}>
                      <i className={"fa fa-clock-o"} />
                    </div>
                  </div>
                  <div className={"pt-3 pl-3"}>
                    <span className={"text-uppercase"}>HOURS TRACKED</span>
                  </div>
                  <div className={"pl-4"}>
                    <span className={"hours-tracked"}>{
                      !isNaN((totalDuration / 3600).toFixed(2)) ? (totalDuration / 3600).toFixed(2) : 0.00}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
        <div className={"filter-block"}>
          <Form onSubmit={this.onSearch}>
            <Row>
              <Col lg={"4"} md={"4"} className="mb-0">
                <FormGroup className="mb-0">
                  <InputGroup className="mb-2">
                    <Input
                      type="text"
                      name="search"
                      onChange={this.handleChange}
                      className="form-control"
                      value={search}
                      aria-describedby="searchUser"
                      placeholder="Search by Technician"
                    />
                  </InputGroup>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
                <FormGroup className="mb-0">
                  <Input
                    type="select"
                    name="sort"
                    id="SortFilter"
                    onChange={this.handleChange}
                    value={sort}
                  >
                    <option className="form-control" value={""}>
                      All
                    </option>
                    <option value={"today"}>Today</option>
                    <option value={"thisWeek"}>This Week</option>
                    <option value={"thisMonth"}>This Month</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col lg={"2"} md={"2"} className="mb-0">
                <div className="filter-btn-wrap">
                  <Label className="height17 label" />
                  <div className="form-group mb-0">
                    <span className="mr-2">
                      <Button
                        type="submit"
                        className="btn btn-theme-transparent"
                        id="Tooltip-1"
                      >
                        <i className="icons cui-magnifying-glass" />
                      </Button>
                      <UncontrolledTooltip target="Tooltip-1">
                        Search
                      </UncontrolledTooltip>
                    </span>
                    <span className="">
                      <Button
                        type="button"
                        className="btn btn-theme-transparent"
                        id="Tooltip-2"
                        onClick={this.onReset}
                      >
                        <i className="icon-refresh icons" />
                      </Button>
                      <UncontrolledTooltip target={"Tooltip-2"}>
                        Reset all filters
                      </UncontrolledTooltip>
                    </span>
                  </div>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
        <Table responsive className={"time-log-table"}>
          <thead>
            <tr>
              <th width='50px'>S No.</th>
              <th width={"80px"}>Type</th>
              <th width={"150px"}><i className="fa fa-user"></i> Technician</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th> Start Date Time</th>
              <th> End Date Time</th>
              <th> Duration</th>
              <th>Activity</th>
              <th width={"100px"}>Tech Rate/<small>Hrs</small></th>
              <th width={"80"}>Total</th>
              <th width={"90"} className={"text-center"}>Action</th>
            </tr>
          </thead>
          <tbody>
            {isSuccess ?
              timeLogData && timeLogData.length ? timeLogData.map((timeLog, index) => {
                return (
                  <tr key={index}>
                    <td>{(page - 1) * AppConfig.ITEMS_PER_PAGE + index + 1}</td>
                    <td className={"text-capitalize"}>{timeLog.type}</td>
                    <td className={"text-capitalize"}>{`${timeLog.technicianId.firstName} ${timeLog.technicianId.lastName}`}</td>
                    <td className={"text-capitalize"}>{timeLog.customerId && timeLog.customerId.length ? `${timeLog.customerId[0].firstName} ${timeLog.customerId[0].lastName}` : "-"}</td>
                    <td>{timeLog.vehicleId && timeLog.vehicleId.length ? `${timeLog.vehicleId[0].make} ${timeLog.vehicleId[0].modal}` : "-"}</td>
                    <td>{moment.utc(timeLog.startDateTime).format("MM/DD/YYYY  hh:mm A")}</td>
                    <td>{moment.utc(timeLog.endDateTime).format("MM/DD/YYYY hh:mm A")}</td>
                    <td>{`${calculateDurationFromSeconds(timeLog.duration)}`}</td>
                    <td>{timeLog.activity}</td>
                    <td><Dollor value={`${(timeLog.technicianId.rate).toFixed(2)}`} /></td>
                    <td><Dollor value={`${parseFloat(timeLog.total).toFixed(2)}`} /></td>
                    <td className={"text-center"}>
                      {
                        timeLog.type !== "timeclock" ?
                          <span>
                            <Button
                              size={"sm"}
                              onClick={() => this.handleEditTimeClockModal(timeLog)}
                              id={`edit-${timeLog._id}`}
                              className={"btn-theme-transparent"}
                            >
                              <i className={"icons cui-pencil"} />
                            </Button>{" "}
                            <UncontrolledTooltip target={`edit-${timeLog._id}`}>
                              Edit
                            </UncontrolledTooltip>
                          </span> :
                          null
                      }
                      &nbsp;
                      <Button
                        size={"sm"}
                        id={`delete-${timeLog._id}`}
                        onClick={() => this.handleTimeLogdelete(timeLog._id, timeLog.orderId && timeLog.orderId.length ? timeLog.orderId[0]._id : null)}
                        className={"btn-theme-transparent"}
                      >
                        <i className={"icons cui-trash"} />
                      </Button>
                      <UncontrolledTooltip target={`delete-${timeLog._id}`}>
                        Delete
                      </UncontrolledTooltip>
                    </td>
                  </tr>
                )
              }) :
                <tr>
                  <td className={"text-center"} colSpan={8}>
                    <NoDataFound showAddButton message={"Currently there are no time logs added."} noResult={false} onAddClick={handleTimeClockModal} />
                  </td>
                </tr> :
              (
                <tr>
                  <td className={"text-center"} colSpan={10}>
                    <Loader />
                  </td>
                </tr>
              )
            }
          </tbody>
        </Table>
        {totalTimeLogs && isSuccess ? (
          <PaginationHelper
            totalRecords={totalTimeLogs}
            onPageChanged={page => {
              this.setState({ page });
              this.onPageChange(page);
            }}
            currentPage={page}
            pageLimit={AppConfig.ITEMS_PER_PAGE}
          />
        ) : null}
        <CrmTimeClockModal
          openTimeClockModal={timeClockEditModalOpen}
          getUserData={getUserData}
          timeLogEle={timeLogEle}
          handleTimeClockModal={this.handleEditTimeClockModal}
          orderReducer={orderReducer}
          editTimeLogRequest={editTimeLogRequest}
        />
      </div>
    );
  }
}

export default TimeLogList;
