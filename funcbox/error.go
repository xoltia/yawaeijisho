package main

type ErrorCode uint8

// Note: this should only be half of error code type.
// Range 128-255 should be reserved for API errors.
const (
	FailedToExecute ErrorCode = iota
	NoOutputVar
	FailedToMarshallOutputVar
	ScriptTimeout
	UnexpectedMessageType
	InputTimeout
)

var ErrorNames = [...]string{
	"FailedToExecute",
	"NoOutputVar",
	"FailedToMarshallOutputVar",
	"ScriptTimeout",
	"UnexpectedMessageType",
	"InputTimeout",
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
