# Solution for circular object issue

## Tracking down the issue

First, open llnode with the generated core dump file:

```
llnode node -c ./core
```

It's an uncaught exception issue, and the best feature we have to track down
this kind of proble is `v8 findjsobjects`.

```
(llnode) v8 findjsobjects
 Instances  Total Size Name
 ---------- ---------- ----
          1         24 WebAssembly
          1         24 _Reply
          1         24 _Request
          1         24 console
          1         40 WriteWrap
          1         48 Parser
          1         56 AssertionError
          1         56 Comparison
          1         56 Control
          1         56 DefaultDeserializer
          1         56 DefaultSerializer
          1         56 Deserializer
          1         56 Dirent
          1         56 DirentFromStats
          1         56 DuplexPair
          1         56 DuplexSocket
          1         56 FastBuffer
          1         56 Immediate
          1         56 JSStreamWrap
          1         56 Script
          1         56 SecurePair
          1         56 Serializer
          1         56 SocketListReceive
          1         56 SocketListSend
          1         56 SystemError
          1         56 TextDecoder
          1         56 TextEncoder
          1         56 URL
          1         56 URLContext
          1         56 URLSearchParams
          1         96 Schemas
          1        104 Mime
          1        104 Stack
          1        104 StringDecoder
          1        112 Plugin
          1        120 Console
          1        128 TimersList
          1        136 ServerResponse
          1        144 Server
          1        168 Boot
          1        176 Timeout
          1        248 IncomingMessage
          1        264 Socket
          2         48 process
          2         64 ChannelWrap
          2         64 HTTPParser
          2         64 Signal
          2         64 Timer
          2         72 (Object)
          2        152 Resolver
          2        160 FixedQueue
          2        160 Monster
          2        176 FreeList
          2        192 Cache
          2        208 EventEmitter
          2        208 ImmediateList
          2        208 SchemaObject
          2        208 WriteStream
          2        296 Agent
          2        304 Router
          2        384 Ajv
          3         96 TCP
          3         96 TTY
          3        912 WritableState
          4       1152 ReadableState
          5        504 BufferList
          6       1248 Context
          7        224 SemVerStore
          7        336 ContentTypeParser
          7        392 Hooks
          7        728 LRU
          9       2120 (anonymous)
         11        352 IPv6
         11        792 Task
         14       1120 Node
         15        480 IPv4
         28       2016 (ArrayBufferView)
         63       1512 CallSite
         96       8448 NativeModule
         97       3104 ContextifyScript
        181      14424 Module
        208      11648 NodeError
        274      15344 FixedCircularBuffer
       1501      85520 Object
       2345      75040 (Array)
      16314     113224 (String)
     558512   31276672 TickObject
    1117032   53617536 Promise
 ---------- ----------
    1696842   85241504
```

Woah, that's a lot of Promises and TickObjects. We want to find what's keeping
those objects on memory, and we need a few Promise objects to do that. Let's use
`v8 findjsinstances -n 10` (**use `-n 10`, otherwise llnode will print ALL promises**).

```
(llnode) v8 findjsinstances -n 10 Promise
0x3ff6a5b76109:<Object: Promise>
0x3ff6a5b760d9:<Object: Promise>
0x3ff6a5b761b1:<Object: Promise>
0x3ff6a5b76181:<Object: Promise>
0x3ff6a5b76259:<Object: Promise>
0x3ff6a5b76229:<Object: Promise>
0x3ff6a5b76301:<Object: Promise>
0x3ff6a5b762d1:<Object: Promise>
0x3ff6a5b763a9:<Object: Promise>
0x3ff6a5b76379:<Object: Promise>
..........
(Showing 1 to 10 of 1117032 instances)
```
With a few Promise objects we can use `v8 findrefs`:

> If your findrefs run don't return anything, try with another promise object.

```
(llnode) v8 findrefs 0x3ff6a5b76181
0x3ff6a5b75101: Context.pl=0x3ff6a5b76181
```

Our promise object is being referenced by a Context object. Contexts are used
by V8 to store variables visible by a a given function. Let's inspect this Context
to find out more:

```
(llnode) v8 inspect 0x3ff6a5b75101
0x3ff6a5b75101:<Context: {
  (previous)=0x30398f59159:<Context>,
  (scope_info)=0x8a0f39a3369:<ScopeInfo: for function anthropomorpicScore>,
  pl=0x3ff6a5b76181:<Object: Promise>,
  pr=0x3ff6a5b761b1:<Object: Promise>}>
```

Alright, this Context belongs to anthropomorpicScore and is holding two
Promises. Maybe this function is still in our stack? Let's see:

```
(llnode) v8 bt
 * thread #1: tid = 265, 0x00007fb207cbffff libc.so.6`gsignal + 207, name = 'node', stop reason = signal SIGABRT
  * frame #0: 0x00007fb207cbffff libc.so.6`gsignal + 207
    frame #1: 0xfffffffe7fffffff
    frame #2: 0x00000000008d211c node`node::OnFatalError(char const*, char const*) + 44
    frame #3: 0x0000000000b02b6e node`v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) + 78
    frame #4: 0x0000000000b02da4 node`v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) + 516
    frame #5: 0x0000000000ef02e2 node`v8::internal::Heap::FatalProcessOutOfMemory(char const*) + 18
    frame #6: 0x0000000000ef03e8 node`v8::internal::Heap::CheckIneffectiveMarkCompact(unsigned long, double) + 168
    frame #7: 0x0000000000efc512 node`v8::internal::Heap::PerformGarbageCollection(v8::internal::GarbageCollector, v8::GCCallbackFlags) + 1762
    frame #8: 0x0000000000efce44 node`v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) + 436
    frame #9: 0x0000000000effab1 node`v8::internal::Heap::AllocateRawWithRetryOrFail(int, v8::internal::AllocationSpace, v8::internal::AllocationAlignment) + 65
    frame #10: 0x0000000000ec8fd4 node`v8::internal::Factory::NewFillerObject(int, bool, v8::internal::AllocationSpace) + 36
    frame #11: 0x000000000116846e node`v8::internal::Runtime_AllocateInNewSpace(int, v8::internal::Object**, v8::internal::Isolate*) + 110
    frame #12: 0x00003e2343d5c01d <exit>
    frame #13: 0x00003e23441ce270 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 98>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #14: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 95>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #15: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 92>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #16: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 86>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #17: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 83>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #18: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 80>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #19: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 74>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #20: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 71>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #21: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 68>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #22: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 62>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #23: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 59>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #24: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 56>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #25: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 53>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #26: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 47>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #27: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 41>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #28: 0x00003e23441cdbb6 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 35>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #29: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 32>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #30: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 29>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #31: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 26>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #32: 0x00003e23441cdb63 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 23>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #33: 0x00003e2343d118b5 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 17>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #34: 0x00003e2343d118b5 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 14>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #35: 0x00003e2343d118b5 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 11>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #36: 0x00003e2343d118b5 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 8>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #37: 0x00003e2343d118b5 anthropomorpicScore(this=0xf01e80826f1:<undefined>, <Smi: 5>) at /app/app/utils/spookiness.js:3:29 fn=0x0000030398f59279
    frame #38: 0x00003e2343d118b5 spookiness(this=0xf01e80826f1:<undefined>, <Smi: 123>, <Smi: 5>) at /app/app/utils/spookiness.js:33:26 fn=0x0000030398f58fd1
    frame #39: 0x00003e2343d118b5 createMonster(this=0x3094111989a9:<function: Monster at /app/app/models/monsters.js:6:1>, 0x75c4f2616b1:<String: "123">, 0x8a0f39a0a61:<String: "ghost">, <Smi: 123>, <Smi: 5>) at /app/app/models/monsters.js:34:29 fn=0x000030941119a031
    frame #40: 0x00003e2343d118b5 createMonster(this=0x292160616799:<Object: Object>, 0x1b8a425029d1:<Object: _Request>, 0x1b8a425029b9:<Object: _Reply>) at /app/app/controllers/monsters.js:21:23 fn=0x0000030398f544c9
    frame #41: 0x00003e2343d118b5 preHandlerCallback(this=0xf01e80826f1:<undefined>, 0xf01e80822b1:<null>, 0x1b8a425029b9:<Object: _Reply>) at /node_modules/fastify/lib/handleRequest.js:85:29 fn=0x00001429daef8121
    frame #42: 0x00003e2343d118b5 handler(this=0xf01e80826f1:<undefined>, 0x1b8a425029b9:<Object: _Reply>) at /node_modules/fastify/lib/handleRequest.js:60:18 fn=0x00001429daef80a1
    frame #43: 0x00003e2343d118b5 done(this=0xf01e80826f1:<undefined>, 0xf01e80822b1:<null>, 0x1b8a42502949:<Object: Object>) at /node_modules/fastify/lib/contentTypeParser.js:85:17 fn=0x00001b8a425029e9
    frame #44: 0x00003e2343d118b5 defaultJsonParser(this=0x75c4f2720e9:<Object: Parser>, 0x1b8a42502ad9:<Object: IncomingMessage>, 0x1b8a42502a79:<String: "{"name":"123","t...">, 0x1b8a425029e9:<function: done at /node_modules/fastify/lib/contentTypeParser.js:85:17>) at /node_modules/fastify/lib/contentTypeParser.js:163:28 fn=0x00001429daea8a09
    frame #45: 0x00003e2343d118b5 onEnd(this=0x1b8a42502ad9:<Object: IncomingMessage>, 0xf01e80826f1:<undefined>) at /node_modules/fastify/lib/contentTypeParser.js:137:18 fn=0x00001b8a42502bd1
    frame #46: 0x00003e2343d0a5a3 <adaptor>
    frame #47: 0x00003e2343d118b5 emit(this=0x1b8a42502ad9:<Object: IncomingMessage>, 0x2f8fac276579:<String: "end">) at events.js:140:44 fn=0x000012df6a5086c1
    frame #48: 0x00003e2343d118b5 endReadableNT(this=0xf01e80826f1:<undefined>, 0x1b8a42502cd1:<Object: ReadableState>, 0x1b8a42502ad9:<Object: IncomingMessage>) at (external).js:1085:23 fn=0x00001a15dd5b7941
    frame #49: 0x00003e2343d118b5 _tickCallback(this=0xee35a283ba9:<Object: process>) at (external).js:41:25 fn=0x0000030398f12f71
    frame #50: 0x00003e2343d0ee55 <internal>
    frame #51: 0x00003e2343d09521 <entry>
    frame #52: 0x0000000000e9ae33 node`v8::internal::Execution::Call(v8::internal::Isolate*, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>, int, v8::internal::Handle<v8::internal::Object>*) + 259
    frame #53: 0x0000000000b28599 node`v8::Function::Call(v8::Local<v8::Context>, v8::Local<v8::Value>, int, v8::Local<v8::Value>*) + 377
    frame #54: 0x0000000000b28751 node`v8::Function::Call(v8::Local<v8::Value>, int, v8::Local<v8::Value>*) + 65
    frame #55: 0x00000000008a33f6 node`node::InternalCallbackScope::Close() + 518
    frame #56: 0x00000000008d3767 node`node::InternalMakeCallback(node::Environment*, v8::Local<v8::Object>, v8::Local<v8::Function>, int, v8::Local<v8::Value>*, node::async_context) + 359
    frame #57: 0x000000000089f706 node`node::AsyncWrap::MakeCallback(v8::Local<v8::Function>, int, v8::Local<v8::Value>*) + 134
    frame #58: 0x000000000093b53a node`node::(anonymous namespace)::Parser::OnStreamRead(long, uv_buf_t const&) + 970
    frame #59: 0x00000000009a252e node`node::LibuvStreamWrap::ReadStart()::'lambda0'(uv_stream_s*, long, uv_buf_t const*)::_FUN(uv_stream_s*, long, uv_buf_t const*) + 158
    frame #60: 0x0000000000a393e9 node`uv__read(stream=0x000000000387bf68) at stream.c:1257
    frame #61: 0x0000000000a39a10 node`uv__stream_io(loop=<unavailable>, w=0x000000000387bff0, events=1) at stream.c:1324
    frame #62: 0x0000000000a3f188 node`uv__io_poll(loop=0x000000000247dc00, timeout=120000) at linux-core.c:401
    frame #63: 0x0000000000a2eafb node`uv_run(loop=0x000000000247dc00, mode=UV_RUN_DEFAULT) at core.c:370
    frame #64: 0x00000000008dd035 node`node::Start(v8::Isolate*, node::IsolateData*, std::vector<std::string, std::allocator<std::string> > const&, std::vector<std::string, std::allocator<std::string> > const&) + 1381
    frame #65: 0x00000000008dafc2 node`node::Start(int, char**) + 1122
    frame #66: 0x00007fb207cad2e1 libc.so.6`__libc_start_main + 241
    frame #67: 0x0000000000896c85 node`_start + 41
```

Yes it is, several times! It looks like a recursive function. Recursive
functions with promises can be a 
[bad idea](https://alexn.org/blog/2017/10/11/javascript-promise-leaks-memory.html), 
although in theory they make sense: if you have a heavy computation and you
don't want to block Node.js event loop, you can split your task into multiple
microstasks with Promises and Node.js will compute a microtask per loop cycle.
The result is not quite what we might expect, so me need to refactor our code 
to avoid this Promise recursive memory usage hell. We can't just make a
synchronous recursive function, since this would block our event loop.

Let's take a look at anthropomorpicScore:

```
function anthropomorpicScore(anthropomorpicness) {
  if (anthropomorpicness >= 100) return new Promise((cb) => { cb(1); });

  const pl = anthropomorpicScore(anthropomorpicness + 3);
  const pr = anthropomorpicScore(anthropomorpicness + 6);

  return new Promise((resolve) => { process.nextTick(() => {
    pl.then((a) => {
      pr.then((b) => {
        resolve(a + b);
      });
    });
  }) } );
}
```

Weird implementation, right? We need to reduce the number of unresolved
Promises, but how? Well, this function looks a lot like a Fibonacci function,
and on Fibonacci we can considerably reduce the number of function calls with
dynamic programming (keeping things cached). If we reduce the number of function 
calls, we're reducing the number of promises created, which means we can rewrite
our function like this:

```
const anthropomorpicScoreCache = {};

function anthropomorpicScore(anthropomorpicness) {
  if (anthropomorpicScoreCache[anthropomorpicness] != undefined) return anthropomorpicScoreCache[anthropomorpicness];

  if (anthropomorpicness >= 100) {
    anthropomorpicScoreCache[anthropomorpicness] = new Promise((cb) => { cb(1); });
    return anthropomorpicScoreCache[anthropomorpicness];
  }

  const pl = anthropomorpicScore(anthropomorpicness + 3);
  const pr = anthropomorpicScore(anthropomorpicness + 6);

  anthropomorpicScoreCache[anthropomorpicness] = new Promise((resolve) => { process.nextTick(() => {
    pl.then((a) => {
      pr.then((b) => {
        resolve(a + b);
      });
    });
  }) } );

  return anthropomorpicScoreCache[anthropomorpicness];
}
```

Now we're using way less memory and our function is blazing fast. Woah!
