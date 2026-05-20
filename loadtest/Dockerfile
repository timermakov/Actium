FROM justb4/jmeter:latest

WORKDIR /var/loadtest
COPY test.jmx .

ENTRYPOINT ["jmeter", "-n", "-t", "test.jmx", "-l", "result.jtl"]