
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

**秒杀地址接口**

**秒杀操作优化** 

![1587191759858](http://images.vsnode.com/mynotes-images/202004/19/204522-444785.png)

成本分析

![1587191850187](http://images.vsnode.com/mynotes-images/202004/18/143730-960706.png)

使用 MySQL 的瓶颈分析 (但 update 4w次qps，正常 500次 qps)

![1587192059372](http://images.vsnode.com/mynotes-images/202004/18/144104-899386.png)

MySQL 中解决问题

![1587192363547](http://images.vsnode.com/mynotes-images/202004/18/144604-575262.png)

**优化总结**

- 前端控制：暴露接口，防止按钮重复
- 动静数据分离：CDN缓存，后端缓存
- 事务竞争优化：减少事务锁时间（ACID）

### Redis 优化地址暴露

### 通过缩短 update 行级锁时间

原本

![1587279773549](http://images.vsnode.com/mynotes-images/202004/19/150256-4777.png)

降低 update 是 rowLock 的时间，缩短了一倍网络延迟和GC

![1587279764505](http://images.vsnode.com/mynotes-images/202004/19/150252-298782.png)

代码调整为：

```java
public SeckillExecution executeSeckill(long seckillId, long userPhone, String md5)
    throws SeckillException, RepeatKillException, SeckillCloseException {
    if (md5 == null || !md5.equals(getMD5(seckillId))){
        throw new SeckillException("seckill data rewrite");
    }
    // 减少库存
    Date nowTime = new Date();
    try {
        //  减少库存成功，记录购买行为
        int insertCount = successKilledMapper.insertSuccessKilled(seckillId, userPhone);
        if (insertCount <= 0){
            // 重复秒杀
            throw new RepeatKillException("seckill repeat");
        } else {
            int updateCount = seckillMapper.reduceNumber(seckillId, nowTime);
            if (updateCount <= 0){
                // 没有更新记录
                throw new SeckillCloseException("seckill is closed");
            } else {
                SuccessKilled successKilled = successKilledMapper.queryByIdWithSeckill(seckillId, userPhone);
                return new SeckillExecution(seckillId, SeckillStateEnum.SUCCESS,successKilled);
            }
        }
    }catch (SeckillCloseException e1){
        throw e1;
    }catch (RepeatKillException e2){
        throw e2;
    }catch (Exception e){
        logger.error(e.getMessage(), e);
        // 编译器异常改成运行期异常，方便事务回滚
        throw new SeckillException("seckill inner error");
    }
}
```

### 事务 SQL 在MySQL 段执行（存储过程）

存储过程的目的是让update insert 能够在本地进行事务缩短了时间

