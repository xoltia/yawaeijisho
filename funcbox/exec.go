package main

import (
	"log"
	"time"

	v8 "rogchap.com/v8go"
)

type CallMessage struct {
	Script    string                 `json:"script"`
	Inputs    map[string]interface{} `json:"inputs"`
	OutputVar string                 `json:"output"`
}

type PromptMessage struct {
	Prompt  string   `json:"prompt"`
	Options []string `json:"options"`
}

type RunResult struct {
	success    bool
	errorCode  ErrorCode
	jsonReturn []byte
}

// Sends out the object that a script returned
// (which should be a JS object, converted into a map with string keys)
type ResultChan <-chan RunResult

// Sends slices of prompt messages at a time
type PromptChan <-chan PromptMessage

// Receives (string) input for the currently pending prompt
type InputChan chan<- string

// Channel where goroutines will borrow isolates from
var isolates chan *v8.Isolate

func initializeVMs(numIsolates int) {
	// These VMs will be reused with new contexts
	isolates = make(chan *v8.Isolate, numIsolates)
	for i := 0; i < numIsolates; i++ {
		isolates <- v8.NewIsolate()
	}
}

func createInputFunction(promptChan chan<- PromptMessage, inputChan <-chan string) func(info *v8.FunctionCallbackInfo) *v8.Value {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		args := info.Args()
		ctx := info.Context()
		iso := ctx.Isolate()

		resolver, err := v8.NewPromiseResolver(ctx)
		promise := resolver.GetPromise().Value

		if len(args) < 2 {
			errStr, _ := v8.NewValue(iso, "Input function must have 2 arguments")
			resolver.Reject(errStr)
			return promise
		}

		promptMsg := args[0].String()
		optionsValue, _ := args[1].AsObject()

		if !optionsValue.IsArray() {
			errStr, _ := v8.NewValue(iso, "Second argument for input function must be an array.")
			resolver.Reject(errStr)
			return promise
		}

		lengthValue, _ := optionsValue.Get("length")

		length := lengthValue.Int32()
		options := make([]string, length)

		for i := int32(0); i < length; i++ {
			element, _ := optionsValue.GetIdx(uint32(i))
			options[i] = element.String()
		}

		if err != nil {
			log.Println("InputFunc: Failed to create promise resolver!")
			info.Context().Isolate().ThrowException(nil)
			return nil
		}

		promptChan <- PromptMessage{promptMsg, options}

		// Wait for input
		go func() {
			input, ok := <-inputChan

			if !ok {
				// The WS connection probably disconnected
				// Cannot be recovered
				errStr, _ := v8.NewValue(iso, "Unexpected error! Client may have disconnected.")
				resolver.Reject(errStr)
				return
			}

			inputValue, _ := v8.NewValue(iso, input)
			resolver.Resolve(inputValue)
		}()

		return promise
	}
}

func createFinishFunction(resultChan chan<- RunResult, promptChan chan<- PromptMessage) func(info *v8.FunctionCallbackInfo) *v8.Value {
	return func(info *v8.FunctionCallbackInfo) *v8.Value {
		args := info.Args()
		ctx := info.Context()

		// If value provided then send error result
		if len(args) < 1 {
			resultChan <- RunResult{false, NoOutputVar, nil}
		} else {
			json, err := args[0].MarshalJSON()
			if err != nil {
				resultChan <- RunResult{false, FailedToMarshallOutputVar, nil}
			} else {
				// TODO: no error code
				resultChan <- RunResult{true, 0, json}
			}
		}

		// Don't let this be called twice
		// or else terrible things will happen
		ctx.Global().Set("finish", v8.Undefined(ctx.Isolate()))
		ctx.Global().Set("input", v8.Undefined(ctx.Isolate()))
		ctx.Isolate().TerminateExecution()
		return nil
	}
}

// Hacky workaround, v8go does not support arrays.
// Look into finding another fix or creating fork with support
func createArray(ctx *v8.Context) *v8.Object {
	arr, _ := ctx.RunScript("new Array()", "")
	arrObj, _ := arr.AsObject()
	return arrObj
}

func populateArray(iso *v8.Isolate, ctx *v8.Context, array *v8.Object, slice []interface{}) {
	if !array.IsArray() {
		panic("Expected array value.")
	}

	for i, elem := range slice {
		switch elem.(type) {
		// If the element is an array then recursively fill
		case []interface{}:
			childArray := createArray(ctx)
			populateArray(iso, ctx, childArray, elem.([]interface{}))
			array.SetIdx(uint32(i), childArray)
		case map[string]interface{}:
			childObj := createObject(iso, ctx, elem.(map[string]interface{}))
			array.SetIdx(uint32(i), childObj)
		default:
			array.SetIdx(uint32(i), elem)
		}
	}
}

func createObject(iso *v8.Isolate, ctx *v8.Context, objMap map[string]interface{}) *v8.Object {
	obj, _ := v8.NewObjectTemplate(iso).NewInstance(ctx)

	for k, v := range objMap {
		switch v.(type) {
		// If the element is an array then recursively fill
		case []interface{}:
			childArray := createArray(ctx)
			populateArray(iso, ctx, childArray, v.([]interface{}))
			obj.Set(k, childArray)
		case map[string]interface{}:
			childObj := createObject(iso, ctx, v.(map[string]interface{}))
			obj.Set(k, childObj)
		default:
			obj.Set(k, v)
		}
	}

	return obj
}

func executeCallMessageWithIsoAndChans(
	callMessage *CallMessage,
	isolate *v8.Isolate,
	resultChan chan<- RunResult,
	promptChan chan<- PromptMessage,
	inputChan <-chan string,
	timout time.Duration,
) {
	// Return the isolate back to the channel when done
	defer func() {
		isolates <- isolate
	}()

	// This is the result channel which will be sent to the finish function
	// since it is possible finish will never be called, we do not want to rely
	// on it calling the given channel
	possibleResultChan := make(chan RunResult, 1)

	// Create global template
	globalTemplate := v8.NewObjectTemplate(isolate)
	globalArrays := make(map[string][]interface{})
	globalObjects := make(map[string]map[string]interface{})

	for k, v := range callMessage.Inputs {
		// If it is an array then it cannot be set as part of the template
		// It will be set after the context is created

		if arrayValue, ok := v.([]interface{}); ok {
			globalArrays[k] = arrayValue
		} else if objValue, ok := v.(map[string]interface{}); ok {
			// Cannot use a normal object template because there may be array properties
			globalObjects[k] = objValue
		} else {
			globalTemplate.Set(k, v)
		}
	}

	finishFuncTemplate := v8.NewFunctionTemplate(isolate, createFinishFunction(possibleResultChan, promptChan))
	inputFuncTemplate := v8.NewFunctionTemplate(isolate, createInputFunction(promptChan, inputChan))

	globalTemplate.Set(callMessage.OutputVar, v8.NewObjectTemplate(isolate))
	globalTemplate.Set("finish", finishFuncTemplate)
	globalTemplate.Set("input", inputFuncTemplate)

	// Create new context with input map as global object
	ctx := v8.NewContext(isolate, globalTemplate)

	// Need to add arrays and objects
	global := ctx.Global()

	for arrayName, array := range globalArrays {
		arrayObj := createArray(ctx)
		populateArray(isolate, ctx, arrayObj, array)
		global.Set(arrayName, arrayObj)
	}

	for objName, objectMap := range globalObjects {
		object := createObject(isolate, ctx, objectMap)
		global.Set(objName, object)
	}

	// Run script
	_, err := ctx.RunScript(callMessage.Script, "func.js")

	// Send unsuccessful result if error occurred
	// It is possible that finish was called first,
	// in which case it will error silently
	if err != nil {
		select {
		case resultChan <- RunResult{false, FailedToExecute, nil}:
			return
		default:
		}
	}

	select {
	case result := <-possibleResultChan:
		resultChan <- result
	case <-time.After(timout):
		resultChan <- RunResult{false, ScriptTimeout, nil}
	}
	close(promptChan)
}

func executeCallMessage(callMessage *CallMessage, timout time.Duration) (result ResultChan, prompt PromptChan, input InputChan) {
	resultChan := make(chan RunResult, 1)
	promptChan := make(chan PromptMessage)
	inputChan := make(chan string)

	// Wait for an isolate to become available
	isolate := <-isolates

	go executeCallMessageWithIsoAndChans(callMessage, isolate, resultChan, promptChan, inputChan, timout)

	return resultChan, promptChan, inputChan
}
