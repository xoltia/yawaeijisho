ENV_FILE=docker.env
PORT=${1:-8080}

if [ ! -f "$ENV_FILE" ]; then
    echo "Please create a $ENV_FILE file. View the docker.env.example file for an example template file."
    echo "Refer to the README and the config.ts source file for more information about available environment variables."
    exit 1
fi

echo "Binding to port $PORT"

docker run --env-file=$ENV_FILE -d -p $PORT:3080 xoltia/yawaeijisho:latest
