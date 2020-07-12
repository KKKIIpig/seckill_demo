package org.seckill.pojo.dto;

/*
    @author www.github.com/Acc2020
    @date  2020/4/13
    暴露秒杀接口

*/

import com.sun.tracing.dtrace.ArgsAttributes;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Exposer {

    // 是否开启秒杀
    private boolean exposed;

    // 对接口加密
    private String md5;

    //id
    private long seckillId;

    // 系统当前时间(毫秒)
    //有可能用户调用该接口时秒杀还未开始，就不能告诉他秒杀地址，而是要返回一个系统时间，
    //方便用户浏览器去控制服务器的时间来定位到秒杀的计时工作。
    private long now;
    // 开启时间
    private long start;
    //结束时间
    private long end;

    public Exposer(boolean exposed, String md5, long seckillId) {
        this.exposed = exposed;
        this.md5 = md5;
        this.seckillId = seckillId;
    }

    public Exposer(boolean exposed, long seckillId, long now, long start, long end) {
        this.exposed = exposed;
        this.seckillId = seckillId;
        this.now = now;
        this.start = start;
        this.end = end;
    }

    public Exposer(boolean exposed, long seckillId) {
        this.exposed = exposed;
        this.seckillId = seckillId;
    }
}
