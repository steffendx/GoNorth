using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace GoNorth.Logging
{
    /// <summary>
    /// Batching Logger Base Class
    /// </summary>
    public abstract class BatchingLoggerProvider : ILoggerProvider
    {
        /// <summary>
        /// Current Batch
        /// </summary>
        private readonly List<LogMessage> _currentBatch = new List<LogMessage>();

        /// <summary>
        /// Interval
        /// </summary>
        private readonly TimeSpan _interval;

        /// <summary>
        /// Queue Size
        /// </summary>
        private readonly int? _queueSize;

        /// <summary>
        /// Batch Size
        /// </summary>
        private readonly int? _batchSize;

        /// <summary>
        /// Message Queue
        /// </summary>
        private BlockingCollection<LogMessage> _messageQueue;

        /// <summary>
        /// Output Task
        /// </summary>
        private Task _outputTask;

        /// <summary>
        /// Cancellation Token
        /// </summary>
        private CancellationTokenSource _cancellationTokenSource;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="options">Option</param>
        protected BatchingLoggerProvider(IOptions<BatchingLoggerOptions> options)
        {
            BatchingLoggerOptions loggerOptions = options.Value;
            if (loggerOptions.BatchSize <= 0)
            {
                throw new ArgumentOutOfRangeException(nameof(loggerOptions.BatchSize), $"{nameof(loggerOptions.BatchSize)} must be a positive number.");
            }
            if (loggerOptions.FlushPeriod <= TimeSpan.Zero)
            {
                throw new ArgumentOutOfRangeException(nameof(loggerOptions.FlushPeriod), $"{nameof(loggerOptions.FlushPeriod)} must be longer than zero.");
            }

            _interval = loggerOptions.FlushPeriod;
            _batchSize = loggerOptions.BatchSize;
            _queueSize = loggerOptions.BackgroundQueueSize;

            Start();
        }

        /// <summary>
        /// Write Messages Function
        /// </summary>
        /// <param name="messages">Messages to wrtei</param>
        /// <param name="token">Cancellation token</param>
        /// <returns>Task</returns>
        protected abstract Task WriteMessagesAsync(IEnumerable<LogMessage> messages, CancellationToken token);

        /// <summary>
        /// Processes the log queue
        /// </summary>
        /// <param name="state">State</param>
        /// <returns>Task</returns>
        private async Task ProcessLogQueue(object state)
        {
            while (!_cancellationTokenSource.IsCancellationRequested)
            {
                int limit = _batchSize ?? int.MaxValue;

                while (limit > 0 && _messageQueue.TryTake(out LogMessage message))
                {
                    _currentBatch.Add(message);
                    limit--;
                }

                if (_currentBatch.Count > 0)
                {
                    try
                    {
                        await WriteMessagesAsync(_currentBatch, _cancellationTokenSource.Token);
                    }
                    catch
                    {
                        // ignored
                    }

                    _currentBatch.Clear();
                }

                await IntervalAsync(_interval, _cancellationTokenSource.Token);
            }
        }

        /// <summary>
        /// Interval Function
        /// </summary>
        /// <param name="interval">Interval</param>
        /// <param name="cancellationToken">Cancellation Token</param>
        /// <returns>Task</returns>
        protected virtual Task IntervalAsync(TimeSpan interval, CancellationToken cancellationToken)
        {
            return Task.Delay(interval, cancellationToken);
        }

        /// <summary>
        /// Adds a message
        /// </summary>
        /// <param name="timestamp">Timestamp</param>
        /// <param name="message">Message</param>
        internal void AddMessage(DateTimeOffset timestamp, string message)
        {
            if (!_messageQueue.IsAddingCompleted)
            {
                try
                {
                    _messageQueue.Add(new LogMessage { Message = message, Timestamp = timestamp }, _cancellationTokenSource.Token);
                }
                catch
                {
                    //cancellation token canceled or CompleteAdding called
                }
            }
        }

        /// <summary>
        /// Starts the batch
        /// </summary>
        private void Start()
        {
            _messageQueue = _queueSize == null ?
                new BlockingCollection<LogMessage>(new ConcurrentQueue<LogMessage>()) :
                new BlockingCollection<LogMessage>(new ConcurrentQueue<LogMessage>(), _queueSize.Value);

            _cancellationTokenSource = new CancellationTokenSource();
            _outputTask = Task.Factory.StartNew<Task>(
                ProcessLogQueue,
                null,
                TaskCreationOptions.LongRunning);
        }

        /// <summary>
        /// Stops the batch
        /// </summary>
        private void Stop()
        {
            _cancellationTokenSource.Cancel();
            _messageQueue.CompleteAdding();

            try
            {
                _outputTask.Wait(_interval);
            }
            catch (TaskCanceledException)
            {
            }
            catch (AggregateException ex) when (ex.InnerExceptions.Count == 1 && ex.InnerExceptions[0] is TaskCanceledException)
            {
            }
        }

        /// <summary>
        /// Disposes
        /// </summary>
        public void Dispose()
        {
            Stop();
        }

        /// <summary>
        /// Creates a new logger 
        /// </summary>
        /// <param name="categoryName">Category name</param>
        /// <returns>Logger</returns>
        public ILogger CreateLogger(string categoryName)
        {
            return new BatchingLogger(this, categoryName);
        }
    }
}