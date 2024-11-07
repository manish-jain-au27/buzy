export interface User {
  crid: string;
  userid: string;
  name: string;
  short_name: string;
  image: string;
  class: string;
}
export interface Taskk {
  id: number;
  uid: string;
  byuserid: string;
  title: string;
  description: string;
  status: string;
  type: string;
  time: string;
  ischeckedestimate: number;
  task_status: string;
  taksdepartment: string;
  assign_user: User[];
}