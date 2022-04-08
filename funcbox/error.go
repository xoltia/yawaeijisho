package main

type ErrorCode uint8

const (
	FailedToExecute ErrorCode = iota
	NoOutputVar
	FailedToMarshallOutputVar
	ScriptTimeout
	UnexpectedMessageType
)

var ErrorNames = [...]string{
	"FailedToExecute",
	"NoOutputVar",
	"FailedToMarshallOutputVar",
	"ScriptTimeout",
	"UnexpectedMessageType",
}

type ErrorMessage struct {
	Code    ErrorCode `json:"code"`
	Error   string    `json:"error"`
	Message string    `json:"message"`
}

func (err *ErrorMessage) withMessage(message string) *ErrorMessage {
	err.Message = message
	return err
}

func createError(code ErrorCode) *ErrorMessage {
	return &ErrorMessage{
		code,
		ErrorNames[code],
		"",
	}
}
