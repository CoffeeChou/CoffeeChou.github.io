---
layout: post
title: PostMan 玩法
categories: ["技术"]
comments: true
---

安装和基本使用就不记录了，主要是在界面操作。这里记录一些脚本相关的内容。

<!--more-->

### 编写测试脚本

测试脚本是通过 JavaScript 写的，编写测试脚本可以确定输出结果是否是预期结果（就不需要人工判断了）。

除了给单独的某个请求编写测试脚本，还可以给一个目录或一个测试集编写测试脚本。

#### 编写

测试脚本可以使用动态变量，对测试结果进行断言，以及在测试结果之间传递数据。

测试脚本会在收到响应后执行，所以如果点击 **Send** 按钮，PostMan 会在 API 返回数据后执行你写的测试脚本。

> 如果需要在返回结果之前执行测试代码，可以使用 Pre-request 中的脚本。


可以使用 <code>pm.response</code> 对象来验证请求返回的数据。可以使用 <code>pm.test</code> 方法来定义测试，它可以设置测试的名称，并返回 <code>boolean</code> 值来确定该测试是通过还是失败。可以在断言中使用 <code>ChaiJS BDD</code> 语法和 <code>pm.expect</code> 来验证测试的细节内容。

<code>.test</code> 方法的第一个参数是字符串，会在测试结果里看到（也可以认为时测试的名称吧）。

举个栗子，在 <code>Test</code> 标签里输入下面的测试脚本，可以验证返回值是否是 <code>200</code>：
```java
pm.test("Status test", function () {
    pm.response.to.have.status(200);
});
```

点击 <code>Send</code> 按钮运行测试，然后打开测试结果的 <code>Test Results</code> 标签。这个标签的头部会显示有多少个测试通过，以及一共有多少个测试（即 <code>(n/m)</code> 这样的格式）。

如果这个测试返回的代码是 <code>200</code>，那么测试就认为它测试通过了，反之就失败。试着把代码中的期望返回值改为 <code>400</code>，重新执行测试，就会发现测试失败了，因为返回值是 <code>200</code>，而我们期望它返回 <code>400</code>。

> 需要注意的是，在 <code>pm.test</code> 里执行的方法一旦返回 False，就会认为这个测试失败。

例如这样写，测试结果仍然时失败的：
```java
pm.test("Status OK", function () {
    pm.response.to.have.status(200);
    pm.response.to.have.status(400);
});
```

除此之外，还可以测试请求的环境，比如：
```java
pm.test("environment to be production", function () {
    pm.expect(pm.environment.get("env")).to.equal("production");
});
```

可以用其他的语法变量来编写测试脚本（只要是符合逻辑的就可以）：
```java
pm.test("response should be okay to process", function () {
    pm.response.to.not.be.error;
    pm.response.to.have.jsonBody("");
    pm.response.to.not.have.jsonBody("error");
});
```

还可以验证返回数据的格式：
```java
pm.test("response must be valid and have a body" function () {
    pm.response.to.be.ok;
    pm.response.to.be.withBody;
    pm.response.to.be.json;
});
```

### 测试集和文件夹

上面说过了，可以给测试集、文件夹或者单独的一个请求编写测试脚本。为测试集添加一个测试脚本，可以测试 API 项目的工作流程，以覆盖到一些场景测试。

#### 执行顺序

运行一个测试集的测试时，测试集里的所有请求都会按照我们在 PostMan 排的顺序去执行。不过，也可以通过调用 <code>postman.setNextResquest()</code> 来覆盖这些顺序，调用这个方法时，只需要传递请求的名称即可。
```java
postman.setNextRequest("request_name");
```

使用这个方法来调用自己的话，就会循环执行当前的请求了。

#### 停止工作流

停止工作流可以使用：
```javascript
postman.setNextRequest("null");
```

关于 <code>postman.setNextRequest()</code>：
1. 指定一系列请求的名称或 ID；
2. 它也可以用在 Pre-request 或者测试脚本里。如果有多个任务，最后一个值有优先权？
3. 如果没有在一个请求里使用它，测试集 Runner 默认会继续执行下一个请求。

记住两点：

- <code>postman.setNextRequest()</code>总是在当前请求的最后才执行，这意味着如果将这个方法放在其他代码块前面，这些代码块仍然会被执行，最后才来执行这个方法。
- <code>postman.setNextRequest()</code> 是有范围的，如果是在一个文件夹里执行测试，那么它的范围就限制在文件夹里，也就是你可以跳转到这个文件夹里的任意一个请求上，但不能跳出这个文件夹。

### 一些测试脚本的例子

尝试写第一个测试脚本，打开 PostMan 后，输入以下 JavaScript 代码：
```javascript
pm.test("Status code is 200", funciton () {
    pm.response.to.have.status(200);
});
```

还有另外一种写法是：
```javascript
pm.test("Status code is 200", () => {
    pm.expect(pm.response.code).to.eql(200);
});
```

#### 使用多个验证

可以在测试脚本里使用多个断言语句，比如：
```javascript
pm.test("The response has all properties" () => {
    // parse the response json and test three properties
    const responseJson = pm.response.json();
    pm.expect(responseJson.type).to.eql('vip');
    pm.expect(responseJson.name).to.be.a('string');
    pm.expect(responseJson.id).to.have.lengthOf(1);
});
```

只要上面的任意一个判断失败，那么整个测试就是失败的。所有的断言都成功，测试才会通过。

#### 解析返回数据

要对返回数据做判断，要先解析返回的数据。

JSON 数据可以使用下面的语法：
```javascript
const responseJson = pm.response.json();
```

XML 数据可以这样转换为 JSON 格式：
```javascript
const responseJson = xml2Json(pm.response.text());
```

CSV 数据可以用 [csv 解析工具](https://github.com/adaltas/node-csv-parse)这样解析：
```javascript
const parse = require('csv-parse/lib/sync');
const responseJson = parse(pm.response.text());
```

HTML 数据可以用 [cheerio](https://cheerio.js.org/) 这样解析：
```javascript
const $ = cheerio.load（pm.response.text());
// output the html for testing
console.log($.html());
```

#### 在不解析的情况下处理返回结果

有时候，返回的结果不是 JSON, XML, HTML, CSV 或其他可以解析的格式，也仍然可以对返回结果进行验证。

比如，可以验证一个返回的结果里是否包含某个字符串：
```javascript
pm.test("Body contains string", => {
    pm.expect(pm.response.text().to.include("customer_id");
});
```

这时并不知道这个字符串所在的位置，因为返回数据传来的是一整个 body。可以验证返回值是否匹配某个字符串：
```javascript
pm.test("Body is string", function () {
    pm.response.to.have.body("whole-body-text");
});
```

#### 验证 HTTP 返回

除了验证返回的 <code>body</code> 之外，还可以验证返回的 <code>status code</code>, <code>headers</code>, <code>cookies</code>, <code>response time</code> 等等。

##### 验证 body：

```javascript
pm.test("Person is Jane", () => {
    const responseJson = pm.response.json();
    pm.expect(responseJson.name).to.eql("Jane");
    pm.expect(responseJson.age).to.eql(23);
});
```

##### 验证 status code:

```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});
```

有时候，返回其中一个 <code>status code</code> 即可认为测试成功，可以使用 <code>oneOf</code>:
```javascript
pm.test("Successful POST request", () => {
    pm.expect(pm.response.code).to.be.oneOf([201, 202]);
});
```

也可以直接验证返回状态码的文本内容：
```javascript
pm.test("Status code name has string", () => {
    pm.response.to.have.status("Created");
});
```

##### 验证 header

验证返回头是否包含字段：
```javascript
pm.test("Content-Type header is present", () => {
    pm.response.to.have.header("Content-Type");
});
```

还可以验证返回头的字段的值：
```javascript
pm.test("Content-Type header is application/json", () => {
    pm.expect(pm.response.headers.get("Content-Type")).to.eql("application/json");
});
```

##### 验证 cookies

验证返回中是否包含了 cookie：
```javascript
pm.test("Cookie JSESSIONID is present", () => {
    pm.expect(pm.cookies.has("JSESSIONHID")).to.be.true;
});
```

也可以验证 cookie 的值：
```javascript
pm.test("Cookie isLoggedIn has value 1", () => {
    pm.expect(pm.cookies.get("isLoggedIn")).to.eql("1");
});
```

##### 验证响应时间 response time

可以验证测试的响应时间是否在一个指定的范围内：
```javascript
pm.test("Response time is less than 200ms", () => {
    pm.expect(pm.response.responseTime)).to.be.below(200);
});
```

#### 一些常见验证的例子

##### 验证一个返回变量的值

可以验证返回的属性值是否与期望一致：
```javascript
pm.test("Response property matches environment variable", function () {
    pm.expect(pm.response.json().name).to.eql(pm.environment.get("name"));
});
```
##### 验证值的类型

可以验证返回数据中任意一部分的值的类型：
```javascript
/* response has this structure:
{
    "name": "Jane",
    "age": 29,
    "hobbies": [
        "skating",
        "painting",
    ],
    "email": null
}
*/
const jsonData = pm.response.json();
pm.test("Test data type of the response", () => {
   pm.expect(jsonData).to.be.an("object");
   pm.expect(jsonData.name).to.be.a("string");
   pm.expect(jsonData.age).to.be.a("number");
   pm.expect(jsonData.hobbies).to.be.an("array");
   pm.expect(jsonData.email).to.be.null;
});
```

##### 验证数组属性

可以验证数组是否为空，以及是否包含某些特定的元素：
```javascript
/*
response has this structure:
{
    "errors": [],
    "areas": ["goods", "services"],
    "settings": [
        {
            "type": "visual",
            "detail": ["light", "large"]
        }
    ],
}
*/

const jsonData = pm.response.json();
pm.test("Test array properties", () => {
    // errors array is empty
    pm.expect(jsonData.errors).to.be.empty;
    // areas includes "goods"
    pm.expect(jsonData.areas).to.include("goods");
    // get the notification setting object
    const notificationSettings = jsonData.settings.find(m => m.type === "notification");
    pm.expect(notificationSettings).to.be.an("object", "Could not find the setting");
    // detail array should include "sms"
    pm.expect(notificationSettings.detail).to.include("sms");
    // detail array should include all listed
    pm.expect(notificationSettings.detail).to.have.members(["email", "sms"]);
});
```
> <code>.member</code> 里的顺序不会影响测试。

##### 验证对象属性

可以验证对象包含的 keys 和属性：
```javascript
pm.expect({a: 1, b: 2}).to.have.all.keys("a", "b");
pm.expect({a: 1, b: 2}).to.have.any.keys("a", "b");
pm.expect({a: 1, b: 2}).to.not.have.any.keys("c", "d");
pm.expect({a: 1}).to.have.property("a");
pm.expect({a: 1, b: 2}).to.be.an("object").that.has.all.keys("a", "b");
```
> - 验证类型可以是 <code>object</code>, <code>set</code>, <code>array</code> 或 <code>map</code>。
> - 如果没有用 <code>.all</code> 或 <code>.any</code> 来修饰 <code>.keys</code> 的话，默认是 <code>.all</code>。
> - 由于 <code>.keys</code> 是基于目标类型（也就是 object）来说的，所以最好在验证 <code>.keys</code> 之前加上语句验证一下类型。

##### 验证值是一个 set

可以验证返回值的有效字段：
```javascript
pm.test("Value is in valid list", () => {
    pm.expect(pm.response.json().type).to.be.oneOf(["Subscriber", "Customer", "User"]);
});
```

##### 验证一个对象是否被包含

```javascript
/*
response has the following structure:
{
    "id": "d8893057-3e91-4cdd-a36f-a0af460b6373",
    "created": true,
    "errors": []
}
*/

pm.test("Object is contained", () => {
    const expectedObject = {
        "created": true,
        "errors": []
    }
    pm.expect(pm.response.json()).to.deep.include(expectedObject);
});
```

> 使用 <code>.deep</code> 会进行全部的验证，包括 <code>.equal</code>, <code>.include</code>, <code>.members</code>, <code>.keys</code> 和 <code>.property</code>。

##### 验证当前环境

```javascript
pm.test("Check the active environment", () => {
    pm.expect(pm.environment.name).to.eql("Production");
});
```

#### 处理错误

有时会遇到一些错误或者预期之外的情况，可以使用 PostMan 的 Console 来做 debug。

例如，打印一些响应的属性值：
```javascript
console.log(pm.collectionVariables.get("name"));
console.log(pm.response.json().name);
```

打印变量的类型：
```javascript
console.log(typeof pm.response.json().id);
```

还可以通过 console log 来标记哪些代码被执行了，类似于跟踪：
```javascript
if (pm.response.json().id) {
    console.log("id was found!");
    // do something
} else {
    console.log("no id...");
    // do something else
}
```

##### JSON not defined error

有时会遇到 <code>ReferenceError: jsonData is not defined</code> 的问题，一般是因为尝试去查询一个尚未声明的 JSON 对象或者要找的这个对象超出了测试代码的范围，代码编写有错。
```javascript
pm.test("Test 1", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.name).to.eql("John");
});

pm.test("Test 2", () => {
    pm.expect(jsonData.age).to.eql(29); // jsonData is not defined
});
```

##### Assertion undefined error

遇到 <code>AssertionError: expected undefined to deeply equal..</code> 的报错一般是因为要验证的对象没有这个属性 (key) 。
```javascript
pm.expect(jsonData.name).to.eql("John");
```

如果在 jsonData 里没有 <code>name</code> 这个 key，就会报错：<code>AssertionError: expected undefined to deeply equal 'John'</code>

##### 测试未失败

##### 验证返回值的结构

可以使用 <code>tv4</code> 来验证 JSON：
```javascript
const schema = {
    "items": {
        "type": "boolean"
    }
}
const data1 = [true, false];
const data2 = [true, 123];

pm.test("Schema is valid", function () {
    pm.expect(tv4.validate(data1, schema)).to.be.true;
    pm.expect(tv4.validate(data2, schema)).to.be.true;
});
```

也可以这样：
```javascript
const schema = {
    "properties": {
        "alpha": {
            "type": "boolean"
        }
    }
};
pm.test("Schema is valid", function () {
    pm.response.to.have.jsonSchema(schema);
});
```

#### 发送异步请求

发送请求，然后记录返回：
```javascript
pm.sendRequest("http://postman-echo.com/get", function (err, response) {
    console.log(response.json());
});
```

### PostMan 的执行顺序

脚本也会写了一些，还要知道 Postman 的执行顺序。

在一个请求 (request) 中，执行顺序是这样的：
1. 执行 pre-request 中的脚本；
2. 执行 request 请求；
3. 获得 response 返回；
4. 执行 test 脚本。

{% include image.html src="/img/postman/req-resp.jpg" alt="request 执行顺序" desc="在 request 中脚本的执行顺序" %}

而对于每一个测试集 (collection) 里的每一个请求，脚本执行顺序是这样的：
1. 执行测试集的 pre-request 脚本；
2. 执行文件夹的 pre-request 脚本；
3. 执行请求中的 pre-request 脚本；
4. 执行 request 请求；
5. 获得 response 返回；
6. 执行测试集的 test 脚本；
7. 执行文件夹的 test 脚本；
8. 执行请求中的 test 脚本。

{% include image.html src="/img/postman/execOrder.jpg" alt="collection 执行顺序" desc="在 collection 中脚本的执行顺序" %}

> #### 文档参考：
> - [Postman JavaScript reference](https://learning.postman.com/docs/writing-scripts/script-references/postman-sandbox-api-reference/)
> - 后期如果考虑自动化，要看看这个文档：[Integrating with Travis CI](https://learning.postman.com/docs/running-collections/using-newman-cli/integration-with-travis/)
