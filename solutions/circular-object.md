# Solution for circular object issue

## Tracking down the issue

First, open llnode with the generated core dump file:

```
llnode node -c ./core
```

It's an uncaught exception issue. A good place to start is looking at the stack
trace:

```
(llnode) v8 bt
 * thread #1: tid = 113, 0x00000000016abfa9 node`v8::base::OS::Abort() + 9, name = 'node', stop reason = signal SIGILL
  * frame #0: 0x00000000016abfa9 node`v8::base::OS::Abort() + 9
    frame #1: 0x0000000000fabd69 node`v8::internal::Isolate::Throw(v8::internal::Object*, v8::internal::MessageLocation*) + 505
    frame #2: 0x0000000000fc2e04 node`v8::internal::JsonStringifier::StackPush(v8::internal::Handle<v8::internal::Object>) + 132
    frame #3: 0x0000000000fc4501 node`v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) + 2321
    frame #4: 0x0000000000fc5bb1 node`v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<true>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) + 8129
    frame #5: 0x0000000000fc90cd node`v8::internal::JsonStringifier::Result v8::internal::JsonStringifier::Serialize_<false>(v8::internal::Handle<v8::internal::Object>, bool, v8::internal::Handle<v8::internal::Object>) + 5229
    frame #6: 0x0000000000fc9e29 node`v8::internal::JsonStringifier::Stringify(v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>) + 153
    frame #7: 0x0000000000bd1a11 node`v8::internal::Builtin_JsonStringify(int, v8::internal::Object**, v8::internal::Isolate*) + 129
    frame #8: 0x000006df949dc17d
    frame #9: 0x000006df9498a5a3 <adaptor>
    frame #10: 0x000006df949918b5 updateMonster(this=0x35eee4e84e41:<Object: Object>, 0x3f34812e4b31:<Object: _Request>, 0x3f34812e4b79:<Object: _Reply>) at /app/app/controllers/monsters.js:30:23 fn=0x00000533c65d4521
    frame #11: 0x000006df949918b5 preHandlerCallback(this=0x187504b826f1:<undefined>, 0x187504b822b1:<null>, 0x3f34812e4b79:<Object: _Reply>) at /node_modules/fastify/lib/handleRequest.js:85:29 fn=0x00001e67aabdf0e1
    frame #12: 0x000006df949918b5 handler(this=0x187504b826f1:<undefined>, 0x3f34812e4b79:<Object: _Reply>) at /node_modules/fastify/lib/handleRequest.js:60:18 fn=0x00001e67aabdf061
    frame #13: 0x000006df949918b5 done(this=0x187504b826f1:<undefined>, 0x187504b822b1:<null>, 0x3f34812e5779:<Object: Object>) at /node_modules/fastify/lib/contentTypeParser.js:85:17 fn=0x00003f34812e4c59
    frame #14: 0x000006df949918b5 defaultJsonParser(this=0x1e67aabec549:<Object: Parser>, 0x3f34812e2b31:<Object: IncomingMessage>, 0x3f34812e52a9:<String: "{"id":1,"name":"...">, 0x3f34812e4c59:<function: done at /node_modules/fastify/lib/contentTypeParser.js:85:17>) at /node_modules/fastify/lib/contentTypeParser.js:163:28 fn=0x00001e67aaba0ec1
    frame #15: 0x000006df949918b5 onEnd(this=0x3f34812e2b31:<Object: IncomingMessage>, 0x187504b826f1:<undefined>) at /node_modules/fastify/lib/contentTypeParser.js:137:18 fn=0x00003f34812e4dd1
    frame #16: 0x000006df9498a5a3 <adaptor>
    frame #17: 0x000006df949918b5 emit(this=0x3f34812e2b31:<Object: IncomingMessage>, 0x15943073c449:<String: "end">) at events.js:140:44 fn=0x0000159430743541
    frame #18: 0x000006df949918b5 endReadableNT(this=0x187504b826f1:<undefined>, 0x3f34812e2c29:<Object: ReadableState>, 0x3f34812e2b31:<Object: IncomingMessage>) at (external).js:1085:23 fn=0x000032c267137941
    frame #19: 0x000006df949918b5 _tickCallback(this=0x2f6b86303ba9:<Object: process>) at (external).js:41:25 fn=0x00000533c6592e29
    frame #20: 0x000006df9498ee55 <internal>
    frame #21: 0x000006df94989521 <entry>
    frame #22: 0x0000000000e9ae33 node`v8::internal::Execution::Call(v8::internal::Isolate*, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::Object>, int, v8::internal::Handle<v8::internal::Object>*) + 259
    frame #23: 0x0000000000b28599 node`v8::Function::Call(v8::Local<v8::Context>, v8::Local<v8::Value>, int, v8::Local<v8::Value>*) + 377
    frame #24: 0x0000000000b28751 node`v8::Function::Call(v8::Local<v8::Value>, int, v8::Local<v8::Value>*) + 65
    frame #25: 0x00000000008a33f6 node`node::InternalCallbackScope::Close() + 518
    frame #26: 0x00000000008d3767 node`node::InternalMakeCallback(node::Environment*, v8::Local<v8::Object>, v8::Local<v8::Function>, int, v8::Local<v8::Value>*, node::async_context) + 359
    frame #27: 0x000000000089f706 node`node::AsyncWrap::MakeCallback(v8::Local<v8::Function>, int, v8::Local<v8::Value>*) + 134
    frame #28: 0x000000000093b53a node`node::(anonymous namespace)::Parser::OnStreamRead(long, uv_buf_t const&) + 970
    frame #29: 0x00000000009a252e node`node::LibuvStreamWrap::ReadStart()::'lambda0'(uv_stream_s*, long, uv_buf_t const*)::_FUN(uv_stream_s*, long, uv_buf_t const*) + 158
    frame #30: 0x0000000000a393e9 node`uv__read(stream=0x0000000004501d58) at stream.c:1257
    frame #31: 0x0000000000a39a10 node`uv__stream_io(loop=<unavailable>, w=0x0000000004501de0, events=1) at stream.c:1324
    frame #32: 0x0000000000a3f188 node`uv__io_poll(loop=0x000000000247dc00, timeout=4391) at linux-core.c:401
    frame #33: 0x0000000000a2eafb node`uv_run(loop=0x000000000247dc00, mode=UV_RUN_DEFAULT) at core.c:370
    frame #34: 0x00000000008dd035 node`node::Start(v8::Isolate*, node::IsolateData*, std::vector<std::string, std::allocator<std::string> > const&, std::vector<std::string, std::allocator<std::string> > const&) + 1381
    frame #35: 0x00000000008dafc2 node`node::Start(int, char**) + 1122
    frame #36: 0x00007fd66bba72e1 libc.so.6`__libc_start_main + 241
    frame #37: 0x0000000000896c85 node`_start + 41
```

We can see the problem is in a call to `JSON.stringify` coming from
`updateMonster`, but we already had this information. What we didn't know is
what's being passed to JSON.stringify as an argument. Since JSON.stringify is a
V8 builtin function, it can't show us the arguments it's receiving. To find
that ouy, we can either look at the code or find this out inside llnode. Since
we're already using llnode, this seems like a faster approach.

> `v8 inspect -s` also prints the function's source code.

```
(llnode) v8 inspect -s 0x00000533c65d4521
0x533c65d4521:<function: updateMonster at /app/app/controllers/monsters.js:30:23
  context=0x%016lx:<Context: {
    (previous)=0x159430703d61:<Context>,
    (scope_info)=0x260b36bdb669:<ScopeInfo: for function >,
    Monster=0x29b575598a49:<function: Monster at /app/app/models/monsters.js:6:1>,
    serializeMonster=0x533c65d8e49:<function: serializeMonster at /app/app/serializers/monsters.js:3:26>}>
  source:
function updateMonster(request, reply) {
  const monster = Monster.get(parseInt(request.params.id));
  if (monster == undefined) {
    reply.type('application/json').code(404);
    return reply.send({});
  }
  monster.update(request.body);
  reply.type('application/json').code(200);
  reply.send(JSON.stringify(monster));
}
>
```

Ok, so we're giving a `Monster` object to `JSON.stringify`. Let's look what's
inside Monster objects to see if we can find where the cycle is happening:

```
(llnode) v8 findjsinstances -n 10 -d Monster
0x2dbdffb9a0b9:<Object: Monster properties {
    .constructor=0x2dbdffb98aa1:<function: Monster at /app/app/models/monsters.js:6:1>,
    .update=0x2dbdffb9a049:<function: update at /app/app/models/monsters.js:21:9>}>
0x62ece9b8af9:<Object: Monster properties {
    .id=<Smi: 1>,
    .name=0x1b256f2f7ea1:<String: "asd">,
    .type=0x1b256f2f7ea1:<String: "asd">,
    .age=<Smi: 123>,
    .anthropomorpicness=<Smi: 100>,
    .spookiness=0.200000,
    ._previousState=0x62ece9dca81:<Object: Monster>,
    ._nextState=0xe49856026f1:<undefined>}>
0x62ece9dca81:<Object: Monster properties {
    .name=0x1b256f2f7ea1:<String: "asd">,
    .type=0x1b256f2f7ec1:<String: "ghost">,
    .age=<Smi: 123>,
    .anthropomorpicness=<Smi: 100>,
    .spookiness=0.200000,
    ._previousState=0xe49856026f1:<undefined>,
    ._nextState=0x62ece9b8af9:<Object: Monster>,
    .prototype=0xe49856026f1:<undefined>}>
(Showing 1 to 3 of 3 instances)
```

As qe can see, the first Monster is referencing the second one through
`_previsousState`, and the second Monster is referencing the first through
`_nextState`. If we look where those attributes are being initialized, we'll
find out that `Monster.update` keeps an history of changes:

```js
class Monster {
  update({ name, type }) {
    // Keep changes history
    const saveState = Monster._copy(this);
    saveState.prototype = this.prototype;
    if (this._previousState)
      this._previousState._nextState = saveState;
    saveState._nextState = this;
    this._previousState = saveState;

    this.name = name;
    this.type = name;
  }
```

To avoid this issue, we can either make sure there's no cycle, or limit which
fields JSON.stringify will turn into strings. The second options sounds
simpler, and it is also safer if we don't need to expose the history thorugh
this API call. There's also already a function to return only relevant fields
in HTTP responses (`serializeMonster`), so to fix the issue we can apply the
following patch:

```patch
diff --git example-server/app/controllers/monsters.js example-server/app/controllers/monsters.js
index 8c9e692..2953c57 100644
--- example-server/app/controllers/monsters.js
+++ example-server/app/controllers/monsters.js
@@ -35,7 +35,7 @@ function updateMonster(request, reply) {
   }
   monster.update(request.body);
   reply.type('application/json').code(200);
-  reply.send(JSON.stringify(monster));
+  reply.send(serializeMonster(monster));
 }
 
 module.exports = {
```
