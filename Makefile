
start: stop
	# specify exact command to run from 'this' directory perspective
	/bin/bash permissions.sh
	/bin/bash make/start.sh /bin/bash run.sh
	/bin/bash cron.sh

stop:
	# FLAG - name of variable with flag
	# .env - (optional) file with config to load to provide FLAG
	/bin/bash make/stop.sh FLAG .env

status:
	# FLAG - name of variable with flag
	# .env - (optional) file with config to load to provide FLAG
	/bin/bash make/status.sh FLAG .env

# add new server to see if changing
t:
	node test-server.js --port 4001
