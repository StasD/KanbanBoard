using RabbitMQ.Client;

namespace KanbanBoardApi.Common;

public class RabbitMQConnectionFactory : IConnectionFactory
{
    private readonly ConnectionFactory _factory = new();

    public IDictionary<string, object?> ClientProperties
    {
        get => _factory.ClientProperties;
        set { _factory.ClientProperties = value; }
    }

    public string Password
    {
        get => _factory.Password;
        set { _factory.Password = value; }
    }

    public ushort RequestedChannelMax
    {
        get => _factory.RequestedChannelMax;
        set { _factory.RequestedChannelMax = value; }
    }

    public uint RequestedFrameMax
    {
        get => _factory.RequestedFrameMax;
        set { _factory.RequestedFrameMax = value; }
    }

    public TimeSpan RequestedHeartbeat
    {
        get => _factory.RequestedHeartbeat;
        set { _factory.RequestedHeartbeat = value; }
    }

    public string UserName
    {
        get => _factory.UserName;
        set { _factory.UserName = value; }
    }

    public string VirtualHost
    {
        get => _factory.VirtualHost;
        set { _factory.VirtualHost = value; }
    }

    public ICredentialsProvider? CredentialsProvider
    {
        get => _factory.CredentialsProvider;
        set { _factory.CredentialsProvider = value; }
    }

    public Uri Uri
    {
        get => _factory.Uri;
        set { _factory.Uri = value; }
    }

    public SslOption Ssl
    {
        get => _factory.Ssl;
        set { _factory.Ssl = value; }
    }

    public string? ClientProvidedName
    {
        get => _factory.ClientProvidedName;
        set { _factory.ClientProvidedName = value; }
    }

    public TimeSpan HandshakeContinuationTimeout
    {
        get => _factory.HandshakeContinuationTimeout;
        set { _factory.HandshakeContinuationTimeout = value; }
    }

    public TimeSpan ContinuationTimeout
    {
        get => _factory.ContinuationTimeout;
        set { _factory.ContinuationTimeout = value; }
    }

    public ushort ConsumerDispatchConcurrency
    {
        get => _factory.ConsumerDispatchConcurrency;
        set { _factory.ConsumerDispatchConcurrency = value; }
    }

    public IAuthMechanismFactory? AuthMechanismFactory(IEnumerable<string> mechanismNames) => _factory.AuthMechanismFactory(mechanismNames);

    public Task<IConnection> CreateConnectionAsync(CancellationToken cancellationToken = default) => CreateConnectionAsync(ClientProvidedName, cancellationToken);

    public Task<IConnection> CreateConnectionAsync(string? clientProvidedName, CancellationToken cancellationToken = default) => _factory.CreateConnectionAsync(clientProvidedName, cancellationToken);

    public Task<IConnection> CreateConnectionAsync(IEnumerable<string> hostnames, CancellationToken cancellationToken = default) => CreateConnectionAsync(hostnames, ClientProvidedName, cancellationToken);

    public Task<IConnection> CreateConnectionAsync(IEnumerable<string> hostnames, string? clientProvidedName, CancellationToken cancellationToken = default) => _factory.CreateConnectionAsync(hostnames, clientProvidedName, cancellationToken);

    public Task<IConnection> CreateConnectionAsync(IEnumerable<AmqpTcpEndpoint> endpoints, CancellationToken cancellationToken = default) => CreateConnectionAsync(endpoints, ClientProvidedName, cancellationToken);

    public Task<IConnection> CreateConnectionAsync(IEnumerable<AmqpTcpEndpoint> endpoints, string? clientProvidedName, CancellationToken cancellationToken = default) => CreateConnectionAsync(endpoints.Select(endpoint => endpoint.HostName), clientProvidedName, cancellationToken);
}
