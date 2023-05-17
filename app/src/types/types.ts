// Interfaces
// Proto
export interface ProtoCheck {
  id: string;
  checkTime: string;
  workerId: string;
}

export interface ProtoDefaultRes {
  data: ProtoCheck;
}

export interface ProtoCreateReq {
  cardId: string;
  checkDate: string;
  sendMail: boolean;
}

export interface ProtoGetRangeReq {
  cardId: string;
  dateInit: string;
  dateEnd: string;
}
export interface ProtoGetRangeRes {
  data: ProtoCheck[];
}

export interface ProtoDeleteReq {
  masterKey: string;
  checkId: string;
}
export interface ProtoDeleteRes {
  status: "Success";
}

// Worker
export interface ProtoWorker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cardId: string;
}

export interface ProtoWorkerDefaultRes {
  data: ProtoWorker;
}

export interface ProtoWorkerCreateReq {
  firstName: string;
  lastName: string;
  email: string;
  cardId: string;
}

export interface ProtoWorkerGetByIdReq {
  id: string;
}

export interface ProtoWorkerGetByCardIdReq {
  cardId: string;
}

export interface ProtoWorkerUpdateByIdReq {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cardId: string;
}

export interface ProtoWorkerDeleteByIdReq {
  id: string;
}
export interface ProtoWorkerDeleteByIdRes {
  status: string;
}

// Db
export interface DbCheck {
  id: string;
  check_time: Date;
  fk_worker_id: string;
}
