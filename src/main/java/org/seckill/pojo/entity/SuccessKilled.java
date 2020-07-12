package org.seckill.pojo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/*
    @author www.github.com/Acc2020
    @date  2020/4/12
*/
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SuccessKilled {
    private long seckillId;

    private long userPhone;

    private int state;

    private Date createTime;

    //  多对一  有可能一个seckillId实体对应于多个成功秒杀的记录
    private Seckill seckill;
}
