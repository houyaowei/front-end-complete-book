package interfacedemo

import "fmt"


type S struct {
	id int
}

func (p *S)Get() int  {
	return p.id
}

func (p *S) put(v int) {
	p.id = v
}

type I interface {
	Get() int
	Put(int)
}

func InterfacePrint(p I)  {
	fmt.Print(p.Get())
	p.Put(10)
}