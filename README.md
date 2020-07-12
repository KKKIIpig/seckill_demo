
> 以下是我在学习过程中总结的详细的过程，用于回顾复习
## 1、创建项目

### 项目环境：

Java 版本 ： JDK 1.8

Maven 版本 ： maven 3.6.1

开发工具 ： IDEA


### 秒杀业务分析

秒杀业务主要是在商品增加调整库存，用户对库存进行购买秒杀的行为

主要核心是对库存进行处理

这里使用的是 MySQL（事务+行锁） ，现在 redis 也能很好的支持事务，尤其适合在高并发情况下完成。

## 5、web 层

**前端页面流程**

![1586764302146](http://images.vsnode.com/mynotes-images/202004/13/155145-451214.png)

**秒杀流程逻辑**

![1586764385034](http://images.vsnode.com/mynotes-images/202004/13/155305-552723.png)

### Restful

- URL合理的表达方式
- 资源状态和状态转移

**restful 规范**

- /模块/资源/{标识}/集合/...

- GET 查询
- POST 修改删除
- PUT 修改
- DELETE 删除

**秒杀 API 的URL 设计**

![1586764815318](http://images.vsnode.com/mynotes-images/202004/21/220723-497918.png)

### SpringMVC 

Sping MVC 在秒杀系统中的运行流程

![1586764956761](http://images.vsnode.com/mynotes-images/202004/13/160240-101267.png)

HTTP 请求地址映射原理

![1586765043468](http://images.vsnode.com/mynotes-images/202004/18/142248-664463.png)

## 6、秒杀优化

### 能够优化的点

- 前端控制：暴露接口，防止按钮重复
- 动静数据分离：CDN缓存，后端缓存
- 事务竞争优化：减少事务锁时间（ACID）

### Redis 优化地址暴露

### 通过缩短 update 行级锁时间

### 事务 SQL 在MySQL 段执行（存储过程）

存储过程的目的是让update insert 能够在本地进行事务缩短了时间

