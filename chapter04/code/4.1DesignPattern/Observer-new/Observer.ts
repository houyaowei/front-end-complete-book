import Subject from './Subject'

//订阅者(subscribers)，更新接口，
export default interface Observer{
  update(subject: Subject): void;
}
