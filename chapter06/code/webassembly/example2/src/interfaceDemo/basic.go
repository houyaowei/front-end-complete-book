package interfacedemo

import "fmt"

type Integer int

func (a Integer) less (b Integer) bool {
	return a < b
}

func TestLess(){
	var a Integer = 10
	if a.less(20) {
		fmt.Print("test successfully")
	}
}
