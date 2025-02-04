// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.18;

contract EnhancedDataRequestContract {
    enum RequestStatus {
        Pending,
        Approved,
        Rejected
    }

    struct DataRequest {
        uint256 id;
        address requester;
        address user;
        string[] fields;
        RequestStatus status;
    }

    mapping(uint256 => DataRequest) public requests;
    mapping(address => uint256[]) public userToRequestIds;
    mapping(address => uint256[]) public requesterToRequestIds;
    uint256 private requestIdCounter;

    event NewDataRequest(
        uint256 requestId,
        address indexed requester,
        address indexed user,
        string[] fields
    );
    event DataRequestUpdated(uint256 requestId, RequestStatus newStatus);

    modifier onlyRequestUser(uint256 _requestId) {
        require(
            msg.sender == requests[_requestId].user,
            " Only the user can modify this request"
        );
        _;
    }

    function requestData(address _user, string[] memory _fields) public {
        require(_fields.length > 0, " At least one field required");
        requestIdCounter++;

        requests[requestIdCounter] = DataRequest({
            id: requestIdCounter,
            requester: msg.sender,
            user: _user,
            fields: _fields,
            status: RequestStatus.Pending
        });

        userToRequestIds[_user].push(requestIdCounter);
        requesterToRequestIds[msg.sender].push(requestIdCounter);

        emit NewDataRequest(requestIdCounter, msg.sender, _user, _fields);
    }

    function updateRequestStatus(
        uint256 _requestId,
        RequestStatus _status
    ) public onlyRequestUser(_requestId) {
        require(
            requests[_requestId].status == RequestStatus.Pending,
            " Request is already processed"
        );
        requests[_requestId].status = _status;
        emit DataRequestUpdated(_requestId, _status);
    }

    function getRequestStatus(
        uint256 _requestId
    ) public view returns (RequestStatus) {
        return requests[_requestId].status;
    }

    function getUserRequests(
        address _user
    ) public view returns (uint256[] memory) {
        return userToRequestIds[_user];
    }

    function getRequesterRequests(
        address _requester
    ) public view returns (uint256[] memory) {
        return requesterToRequestIds[_requester];
    }
}
