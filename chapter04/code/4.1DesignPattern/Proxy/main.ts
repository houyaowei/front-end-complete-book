/**
 *
 */

import RealSubject from "./RealSubject";
import Proxy from "./Proxy";
import Subject from "./Subject";

let realSubject = new RealSubject();

let subject: Subject = new Proxy(realSubject);
subject.proposal();
