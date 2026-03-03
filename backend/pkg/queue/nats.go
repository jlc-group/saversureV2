package queue

import (
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
)

func NewNATSConn(url string) (*nats.Conn, error) {
	nc, err := nats.Connect(
		url,
		nats.RetryOnFailedConnect(true),
		nats.MaxReconnects(10),
		nats.ReconnectWait(2*time.Second),
		nats.Timeout(5*time.Second),
	)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}
	return nc, nil
}

func NewJetStream(nc *nats.Conn) (nats.JetStreamContext, error) {
	js, err := nc.JetStream()
	if err != nil {
		return nil, fmt.Errorf("create jetstream context: %w", err)
	}
	return js, nil
}
