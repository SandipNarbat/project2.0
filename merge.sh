while :
do
clear
pacepath='/var/www/html/pace'
$pacepath/backend_portal/scripts/onli_requ_job_check.sh
#NOTE MISC# req_job_status.txt #onl_re_status.txt_ is the data file and the script is in path /home/monitorp/newpace/scripts/ONLINE/online_requested_job_check.sh
#tm=`date +%H%M`
#if [ $tm -ge 0005 -a $tm -le 0015 ];then
#       flag=0
#fi
dtc=`date "+%Y%m%d"`
dtf=`cat /production_history/queue/online/si_check_val.txt | awk '{print $2}'`
dt=`cat MFLAGS_D|awk '{print $1}'`
#dt="20120106"
>/opt/hpws/apache/logs/error_log
cat pace_TFFILE.card.txt_all_server.$dt|sort -n > pace_TFFILE_new.card.txt_all_server.$dt
mv pace_TFFILE_new.card.txt_all_server.$dt pace_TFFILE.card.txt_all_server.$dt

p=`cat tps_break_m.$dt tps_break_s?.$dt|sed 's/,/ /g'|awk '{print $1}'| addup`
q=`cat tps_break_m.$dt tps_break_s?.$dt|sed 's/,/ /g'|awk '{print $2}'| addup`
r=`cat tps_break_m.$dt tps_break_s?.$dt|sed 's/,/ /g'|awk '{print $3}'| addup`
echo " $p , $q , $r " > tps_breakup_8apps.txt.$dt
dateappened=`date +%H:%M:%S`
#echo "$dateappened, $p , $q , $r " >>production_history/tps/tps_breakup_appened.txt.$dt
nr=`cat tps_break_nr_?.$dt|addup`
echo " $nr " >tps_breakup_8apps_nr.txt.$dt
chmod 755 *.$dt
#cat inb_ext_ulhas | head -2 > inb_ext_rep.txt.$dt
cat inb_ext_ganga > inb_ext_rep.txt.$dt
cat inb_ext_jhelum >> inb_ext_rep.txt.$dt
#cat inb_ext_ulhas | tail -3 >> inb_ext_rep.txt.$dt
#cat inb_ext_bhargavi >> inb_ext_rep.txt.$dt
cat inb_ext_sutlej >> inb_ext_rep.txt.$dt
cat inb_ext_jamuna >> inb_ext_rep.txt.$dt
cat inb_ext_girija >> inb_ext_rep.txt.$dt
cat inb_ext_sharda >> inb_ext_rep.txt.$dt

cat queues_in_loop.txt_i_$dt > queues_in_loop.txt_$dt
cat queues_in_loop.txt_I_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_a_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_b_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_c_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_d_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_e_$dt >> queues_in_loop.txt_$dt
cat queues_in_loop.txt_f_$dt >> queues_in_loop.txt_$dt
cd /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING

#paste -d "," queues_in_loop.txt_i_$dt queues_in_loop.txt_I_$dt queues_in_loop.txt_a_$dt queues_in_loop.txt_b_$dt queues_in_loop.txt_c_$dt queues_in_loop.txt_d_$dt queues_in_loop.txt_e_$dt queues_in_loop.txt_f_$dt > queues_in_loop.txt_$dt
##paste -d "," growth_rate.txt_i_$dt growth_rate.txt_I_$dt growth_rate.txt_a_$dt growth_rate.txt_b_$dt growth_rate.txt_c_$dt growth_rate.txt_d_$dt growth_rate.txt_e_$dt growth_rate.txt_f_$dt growth_rate.txt_g_$dt > growth_rate.txt.$dt
paste -d ";" stat_files_in_production.txt.$dt stat_files_in_target.txt.$dt start_time_files.txt.$dt end_time_files.txt.$dt > stat_files_in_tar_pro.txt.$dt
cat b24_logcheck_sutlej.txt b24_logcheck_ganga.txt b24_logcheck_sharda.txt b24_logcheck_girija.txt b24_logcheck_jhelum.txt b24_logcheck_jamuna.txt b24_logcheck_BHARGAVI.txt b24_logcheck_ULHAS.txt > b24_logcheck_8apps.txt.$dt
cat tns.txt_m_$dt tns.txt_s1_$dt tns.txt_s2_$dt tns.txt_s3_$dt tns.txt_s4_$dt tns.txt_s5_$dt tns.txt_s6_$dt tns.txt_s7_$dt > tns_summary.txt.$dt
#paste -d "," gateway_m.txt.$dt gateway_s1.txt.$dt gateway_s2.txt.$dt gateway_s3.txt.$dt gateway_s4.txt.$dt gateway_s5.txt.$dt gateway_s6.txt.$dt gateway_s7.txt.$dt gateway_s8.txt.$dt gateway_s9.txt.$dt gateway_s10.txt.$dt gateway_s11.txt.$dt gateway_m.txt.$dt  >  gateway.txt_8app.$dt
paste -d "," gateway_i.txt.$dt gateway_I.txt.$dt gateway_a.txt.$dt gateway_b.txt.$dt gateway_c.txt.$dt gateway_d.txt.$dt gateway_e.txt.$dt gateway_f.txt.$dt gateway_g.txt.$dt gateway_h.txt.$dt gateway_j.txt.$dt gateway_k.txt.$dt gateway_m.txt.$dt gateway_n.txt.$dt gateway_p.txt.$dt gateway_q.txt.$dt >  gateway.txt_8app.$dt
#paste -d "," gateway_m.txt.$dt gateway_s1.txt.$dt gateway_s2.txt.$dt gateway_s3.txt.$dt gateway_s4.txt.$dt gateway_s5.txt.$dt gateway_s6.txt.$dt gateway_s7.txt.$dt gateway_s8.txt.$dt >  gateway.txt_8app.$dt
#paste -d "," gateway_i.txt.$dt gateway_I.txt.$dt gateway_a.txt.$dt gateway_b.txt.$dt gateway_c.txt.$dt gateway_d.txt.$dt gateway_e.txt.$dt gateway_f.txt.$dt gateway_g.txt.$dt >  gateway.txt_8app.$dt
#paste -d "," gateway_yono_m.txt.$dt gateway_yono_s1.txt.$dt gateway_yono_s2.txt.$dt gateway_yono_s3.txt.$dt gateway_yono_s4.txt.$dt gateway_yono_s5.txt.$dt gateway_yono_s6.txt.$dt gateway_yono_s7.txt.$dt gateway_yono_s8.txt.$dt > gateway_yono.txt_8app.$dt
paste -d "," gateway_yono_app1.txt.$dt gateway_yono_app2.txt.$dt gateway_yono_app3.txt.$dt gateway_yono_app4.txt.$dt gateway_yono_app5.txt.$dt gateway_yono_app6.txt.$dt gateway_yono_app7.txt.$dt gateway_yono_app8.txt.$dt gateway_yono_app9.txt.$dt gateway_yono_app10.txt.$dt gateway_yono_app11.txt.$dt gateway_yono_app12.txt.$dt gateway_yono_app13.txt.$dt gateway_yono_app14.txt.$dt gateway_yono_app15.txt.$dt gateway_yono_app16.txt.$dt > gateway_yono.txt_8app.$dt
#paste -d "," gateway_yono_app1.txt.$dt gateway_yono_app2.txt.$dt gateway_yono_app3.txt.$dt gateway_yono_app4.txt.$dt gateway_yono_app5.txt.$dt gateway_yono_app6.txt.$dt gateway_yono_app7.txt.$dt gateway_yono_app8.txt.$dt gateway_yono_app9.txt.$dt > gateway_yono.txt_8app.$dt
#paste -d "," gateway_yono_HIMALAYA.txt.$dt gateway_yono_SAHYADRI.txt.$dt gateway_yono_SATPURA.txt.$dt gateway_yono_NILGIRI.txt.$dt gateway_yono_ARAVALI.txt.$dt gateway_yono_VINDHYA.txt.$dt            gateway_yono_PALANI.txt.$dt gateway_yono_KAILASH.txt.$dt gateway_yono_MIZO.txt.$dt > gateway_yono.txt_8app.$dt
#paste -d "," gateway_yono_app*.txt.$dt > gateway_yono.txt_8app.$dt
#paste -d "," gateway_m.txt.$dt gateway_s1.txt.$dt gateway_s2.txt.$dt gateway_s3.txt.$dt gateway_s4.txt.$dt gateway_s5.txt.$dt gateway_s6.txt.$dt gateway_s7.txt.$dt gateway_s8.txt.$dt >> /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/gateway_appended.txt_8app.$dt
#echo "SWAP STATUS,`cat swap_memory.txt_$dt|head -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -2|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -3|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -4|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -5|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -6|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|head -7|tail -1|awk '{print $7}'`,`cat swap_memory.txt_$dt|tail -1|awk '{print $7}'`" >> gateway.txt_8app.$dt
cp queue_buildup_s6.txt.$dt qbds6.txt.$dt
cat CIF_build.txt_$dt>>qbds6.txt.$dt
cat GEN_build.txt_$dt>>qbds6.txt.$dt
paste -d "," queue_buildup_i.txt.$dt queue_buildup_I.txt.$dt queue_buildup_a.txt.$dt queue_buildup_b.txt.$dt queue_buildup_c.txt.$dt queue_buildup_d.txt.$dt queue_buildup_e.txt.$dt queue_buildup_f.txt.$dt queue_buildup_g.txt.$dt queue_buildup_h.txt.$dt queue_buildup_j.txt.$dt queue_buildup_k.txt.$dt queue_buildup_m.txt.$dt queue_buildup_n.txt.$dt queue_buildup_p.txt.$dt queue_buildup_q.txt.$dt  >  status_queue_8app.txt.$dt
#paste -d "," queue_buildup_i.txt.$dt queue_buildup_I.txt.$dt queue_buildup_a.txt.$dt queue_buildup_b.txt.$dt queue_buildup_c.txt.$dt queue_buildup_d.txt.$dt queue_buildup_e.txt.$dt queue_buildup_f.txt.$dt queue_buildup_g.txt.$dt >  status_queue_8app.txt.$dt
paste -d "," queue_buildup_i.txt.$dt queue_buildup_I.txt.$dt queue_buildup_a.txt.$dt queue_buildup_b.txt.$dt queue_buildup_c.txt.$dt queue_buildup_d.txt.$dt queue_buildup_e.txt.$dt queue_buildup_f.txt.$dt queue_buildup_g.txt.$dt >>production_history/queue/online/status_consolidated_queue_8app.txt.$dt
#echo "`date|awk '{print $4}'|cut -c 1-5`" >>production_history/queue/online/status_consolidated_queue_8app.txt.$dt
cd -
paste -d "," queue_buildup_nr_i.txt.$dt queue_buildup_nr_I.txt.$dt queue_buildup_nr_a.txt.$dt queue_buildup_nr_b.txt.$dt queue_buildup_nr_c.txt.$dt queue_buildup_nr_d.txt.$dt queue_buildup_nr_e.txt.$dt queue_buildup_nr_f.txt.$dt queue_buildup_nr_g.txt.$dt >queue_buildup_nr_9app.txt.$dt
paste -d "," start_time.txt_m.$dt start_time.txt_s1.$dt start_time.txt_s2.$dt start_time.txt_s3.$dt start_time.txt_s4.$dt start_time.txt_s5.$dt start_time.txt_s6.$dt start_time.txt_s7.$dt start_time.txt_s8.$dt >  start_time_8app.txt.$dt
paste -d "," neft_dup.txt_m_$dt neft_dup.txt_s1_$dt neft_dup.txt_s2_$dt neft_dup.txt_s3_$dt neft_dup.txt_s4_$dt neft_dup.txt_s5_$dt > neft_dup_all.txt.$dt
cat tf_tot_s2.txt.$dt tf_tot_s3.txt.$dt tf_tot_s4.txt.$dt tf_tot_s5.txt.$dt tf_tot_s6.txt.$dt > tf_tot.$dt
paste -d "," arka_bu5_path  bu5_arka_m.txt.$dt bu5_arka_s1.txt.$dt bu5_arka_s2.txt.$dt bu5_arka_s3.txt.$dt bu5_arka_s4.txt.$dt bu5_arka_s5.txt.$dt bu5_arka_s6.txt.$dt bu5_arka_s7.txt.$dt bu5_arka_s8.txt.$dt bus5_arka_sf.txt.$dt >  bu5_arka.txt.$dt
#paste -d "," arka_bu5_path  bu5_arka_m.txt.$dt bu5_arka_s1.txt.$dt bu5_arka_s2.txt.$dt bu5_arka_s3.txt.$dt bu5_arka_s4.txt.$dt bu5_arka_s5.txt.$dt bu5_arka_s6.txt.$dt bu5_arka_s7.txt.$dt bu5_arka_s8.txt.$dt >  bu5_arka.txt.$dt
paste -d "," path_for_bu_files  bu_arka_i.txt.$dt bu_arka_I.txt.$dt bu_arka_a.txt.$dt bu_arka_b.txt.$dt bu_arka_c.txt.$dt bu_arka_d.txt.$dt bu_arka_e.txt.$dt bu_arka_f.txt.$dt bu_arka_g.txt.$dt > bu_arka.txt.$dt
paste -d "," ocr_neft_m.txt.$dt neft_s1.txt.$dt neft_s2.txt.$dt neft_s3.txt.$dt neft_s4.txt.$dt neft_s5.txt.$dt neft_s6.txt.$dt neft_s7.txt.$dt neft_s8.txt.$dt neft_s9.txt.$dt neft_s10.txt.$dt neft_s11.txt.$dt neft_s12.txt.$dt neft_s13.txt.$dt neft_s14.txt.$dt neft_s15.txt.$dt > ocr_neft_8apps.txt.$dt
#paste -d "," ocr_neft_m.txt.$dt neft_s1.txt.$dt neft_s2.txt.$dt neft_s3.txt.$dt neft_s4.txt.$dt neft_s5.txt.$dt neft_s6.txt.$dt neft_s7.txt.$dt >  ocr_neft_8apps.txt.$dt
#paste -d "," ocr_neft_m.txt.$dt neft_s1.txt.$dt neft_s2.txt.$dt neft_s3.txt.$dt neft_s4.txt.$dt neft_s5.txt.$dt neft_s6.txt.$dt neft_s7.txt.$dt neft_s8.txt.$dt neft_s9.txt.$dt neft_s10.txt.$dt neft_s11.txt.$dt  >  ocr_neft_8apps.txt.$dt
paste -d "," grpt_status_m.txt.$dt grpt_status_s1.txt.$dt grpt_status_s2.txt.$dt grpt_status_s3.txt.$dt grpt_status_s4.txt.$dt grpt_status_s5.txt.$dt grpt_status_s6.txt.$dt grpt_status_s7.txt.$dt grpt_status_s8.txt.$dt >  grpt_status_8apps.txt.$dt
paste -d "," nsbl_status_m.txt.$dt nsbl_status_s1.txt.$dt nsbl_status_s2.txt.$dt nsbl_status_s3.txt.$dt nsbl_status_s4.txt.$dt nsbl_status_s5.txt.$dt nsbl_status_s6.txt.$dt  >  nsbl_status_8apps.txt.$dt
paste -d "," grpt_status_m.txt.$dt grpt_status_s1.txt.$dt grpt_status_s2.txt.$dt grpt_status_s3.txt.$dt grpt_status_s4.txt.$dt grpt_status_s5.txt.$dt grpt_status_s6.txt.$dt grpt_status_s7.txt.$dt grpt_status_s8.txt.$dt >  grpt_statustotal.txt.$dt
paste -d ":" STATUS_m.txt_1.$dt STATUS_s1.txt.$dt STATUS_s2.txt.$dt STATUS_s3.txt.$dt STATUS_s4.txt.$dt STATUS_s5.txt.$dt STATUS_s6.txt.$dt STATUS_s7.txt.$dt STATUS_s8.txt_1.$dt > STATUS_8app.txt.$dt
paste -d ":" maxtcp_sutlej.txt maxtcp_ganga.txt maxtcp_sharda.txt maxtcp_girija.txt maxtcp_jhelum.txt maxtcp_jamuna.txt maxtcp_BHARGAVI.txt maxtcp_mandovi.txt maxtcp_terna.txt > maxtcp_8app.txt
paste -d "," i_ack_incoming.txt a_ack_incoming.txt b_ack_incoming.txt c_ack_incoming.txt d_ack_incoming.txt>rtgs_ack_incoming.txt.$dt
cd /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING
paste -d "," region.txt region_i.txt.$dt region_I.txt.$dt region_a.txt.$dt region_b.txt.$dt region_c.txt.$dt region_d.txt.$dt region_e.txt.$dt region_f.txt.$dt >  region_status.txt.$dt
cp /opt/hpws/apache/cgi-bin/trials/bip/data/EOD/RC_Details_8apps.txt.$dt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/RC_Details_8apps.txt
cat failed_ftp_?.txt.$dt > failed_ftp.txt.$dt
cat ignored_ftp_?.txt.$dt > ignored_ftp.txt.$dt
cat topstat_m.txt.$dt topstat_s1.txt.$dt topstat_s2.txt.$dt topstat_s3.txt.$dt topstat_s4.txt.$dt topstat_s5.txt.$dt topstat_s6.txt.$dt topstat_s7.txt.$dt topstat_s8.txt.$dt topstat_s9.txt.$dt topstat_s10.txt.$dt topstat_s11.txt.$dt topstat_s12.txt.$dt topstat_s13.txt.$dt topstat_s14.txt.$dt topstat_s15.txt.$dt  >  topstat_8apps.txt.$dt
cd /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/
cat atm_offline_stat_4pace_??.txt atmib_night.txt > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/atm_offline_stat_4pace.txt.$dt
cat atm_offline_stat_4pace_??.txt atmib_night.txt > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/atm_offline_stat_4pace.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/off_online_i.txt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/off_online_[Iabcde].txt > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/chk_off_online_4apps.txt.$dt
cat  /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/off_online_i.txt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/off_online_[Iabcde].txt  > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/chk_off_online_4apps.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_i.txt|sed 's/^/ MASTER ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_i.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_I.txt|sed 's/^/ GANGA  ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_I.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_a.txt|sed 's/^/ SHARDA ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_a.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_b.txt|sed 's/^/ GIRIJA ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_b.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_c.txt|sed 's/^/ JHELUM ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_c.txt
cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/time_offline_d.txt|sed 's/^/ JAMUNA ,/g' > /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/onl_time_d.txt
cd  /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING
cat onl_time_i.txt onl_time_[Iabcd].txt atmib_night.txt > time_offline_4APPS.txt
cat onl_time_i.txt onl_time_[Iabcd].txt atmib_night.txt > time_offline_4APPS.txt.$dt
cat ftp_br1221_m.txt_$dt ftp_br1221_s1.txt_$dt ftp_br1221_s2.txt_$dt br1221_stat.txt.$dt ftp_br1221_s4.txt_$dt ftp_br1221_s5.txt_$dt ftp_br1221_s6.txt_$dt > ftp_br1221_7app.txt.$dt
#cat topstat_m.txt.$dt topstat_s1.txt.$dt topstat_s2.txt.$dt topstat_s3.txt.$dt topstat_s4.txt.$dt topstat_s5.txt.$dt topstat_s6.txt.$dt topstat_s7.txt.$dt >  topstat_8apps.txt.$dt
cat top_m.txt.$dt top_s1.txt.$dt top_s2.txt.$dt top_s3.txt.$dt top_s4.txt.$dt top_s5.txt.$dt top_s6.txt.$dt top_s7.txt.$dt top_s8.txt.$dt>  top_8apps.txt_1.$dt
cat top_i.txt.$dt top_I.txt.$dt top_a.txt.$dt top_b.txt.$dt top_c.txt.$dt top_d.txt.$dt top_e.txt.$dt top_f.txt.$dt top_g.txt.$dt> top_8apps_night_1.txt.$dt
#cd -
cat top_nr_i.txt.$dt top_nr_I.txt.$dt top_nr_a.txt.$dt  top_nr_b.txt.$dt top_nr_c.txt.$dt top_nr_d.txt.$dt top_nr_e.txt.$dt top_nr_f.txt.$dt top_nr_g.txt.$dt > top_nr_9apps.$dt
cat top_8apps.txt_1.$dt|sort -n -r -k6 > top_8apps.txt.$dt
cat top_8apps_night_1.txt.$dt|sort -n -r -k6 >top_8apps_night.txt.$dt
#cat hung_m.txt.$dt hung_s1.txt.$dt hung_s2.txt.$dt hung_s3.txt.$dt hung_s4.txt.$dt hung_s5.txt.$dt hung_s6.txt.$dt hung_s7.txt.$dt >  hung_8apps.txt.$dt
cat hung_m.txt.$dt hung_s1.txt.$dt hung_s2.txt.$dt hung_s3.txt.$dt hung_s4.txt.$dt hung_s5.txt.$dt hung_s6.txt.$dt hung_s7.txt.$dt hung_s8.txt.$dt  >  hung_8apps.txt.$dt
cat hung_nr.txt_i.$dt hung_nr.txt_I.$dt hung_nr.txt_a.$dt hung_nr.txt_b.$dt hung_nr.txt_c.$dt hung_nr.txt_d.$dt hung_nr.txt_e.$dt hung_nr.txt_f.$dt hung_nr.txt_g.$dt > hung_nr_9apps.txt.$dt
#cat space_m.txt.$dt space_s1.txt.$dt space_s2.txt.$dt space_s3.txt.$dt space_s4.txt.$dt space_s5.txt.$dt space_s6.txt.$dt space_s7.txt.$dt space_s8.txt.$dt space_s9.txt.$dt space_s10.txt.$dt space_s11.txt.$dt space_s12.txt.$dt space_f1.txt.$dt space_bhaga.txt.$dt space_sf.txt.$dt >  space_8app.txt.$dt
cat space_m.txt.$dt space_s1.txt.$dt space_s2.txt.$dt space_s3.txt.$dt space_s4.txt.$dt space_s5.txt.$dt space_s6.txt.$dt space_s7.txt.$dt space_s8.txt.$dt space_s9.txt.$dt space_s10.txt.$dt space_s11.txt.$dt space_s12.txt.$dt space_s13.txt.$dt space_s14.txt.$dt space_s15.txt.$dt space_bhaga.txt.$dt space_sf.txt.$dt >  space_8app.txt.$dt
cat tf_stat_a.txt.$dt tf_stat_b.txt.$dt tf_stat_c.txt.$dt tf_stat_d.txt.$dt > tf_stat.$dt
cat ora_pace.txt_m.$dt ora_pace.txt_s1.$dt ora_pace.txt_s2.$dt ora_pace.txt_s3.$dt ora_pace_s4.txt.$dt ora_pace_s5.txt.$dt ora_pace_s6.txt.$dt ora_pace.txt_s7.$dt ora_pace.txt_s8.$dt >  ora_pace_8apps.txt.$dt
#cat rr_m.txt.$dt rr_s1.txt.$dt rr_s2.txt.$dt rr_s3.txt.$dt rr_s4.txt.$dt rr_s5.txt.$dt rr_s6.txt.$dt rr_s7.txt.$dt > rr_stat_8apps.txt.$dt
#cat rtgs_ack_m.txt.$dt rtgs_ack_s1.txt.$dt rtgs_ack_s2.txt.$dt rtgs_ack_s3.txt.$dt rtgs_ack_s4.txt.$dt rtgs_ack_s5.txt.$dt rtgs_ack_s6.txt.$dt >rtgs_ack_all.txt.$dt
cat rtgs_ack_m.txt.$dt rtgs_ack_s1.txt.$dt rtgs_ack_s2.txt.$dt rtgs_ack_s3.txt.$dt rtgs_ack_s4.txt.$dt rtgs_ack_s5.txt.$dt  >rtgs_ack_all.txt.$dt
cat rr_m.txt.$dt rr_s1.txt.$dt rr_s2.txt.$dt rr_s3.txt.$dt rr_s4.txt.$dt rr_s5.txt.$dt rr_s6.txt.$dt rr_s7.txt.$dt rr_s8.txt.$dt> rr_stat_8apps.txt.$dt
cat rtgs_mqmonitor.txt_m.txt.$dt rtgs_mqmonitor.txt_s1.txt.$dt rtgs_mqmonitor.txt_s2.txt.$dt rtgs_mqmonitor.txt_s3.txt.$dt rtgs_mqmonitor.txt_s4.txt.$dt rtgs_mqmonitor.txt_s5.txt.$dt rtgs_mqmonitor.s6.txt.$dt rtgs_mqmonitor.s7.txt.$dt > rtgs_mqmonitor_8apps.txt.$dt
cat neft_mqmonitor.txt_m.txt.$dt neft_mqmonitor.txt_s1.txt.$dt neft_mqmonitor.txt_s2.txt.$dt neft_mqmonitor.txt_s3.txt.$dt neft_mqmonitor.txt_s4.txt.$dt neft_mqmonitor.txt_s5.txt.$dt neft_mqmonitor.txt_s6.txt.$dt neft_mqmonitor.txt_s7.txt.$dt > neft_mqmonitor_8apps.txt.$dt
cat mq_neft_m.txt.$dt mq_neft_s1.txt.$dt mq_neft_s2.txt.$dt mq_neft_s3.txt.$dt mq_neft_s4.txt.$dt mq_neft_s5.txt.$dt mq_neft_s6.txt.$dt mq_neft_s7.txt.$dt > mq_neft_8apps.txt.$dt
cat mq_rtgs_m.txt.$dt mq_rtgs_s1.txt.$dt mq_rtgs_s2.txt.$dt mq_rtgs_s3.txt.$dt mq_rtgs_s4.txt.$dt mq_rtgs_s5.txt.$dt mq_rtgs_s6.txt.$dt mq_rtgs_s7.txt.$dt > mq_rtgs_8apps.txt.$dt
cat summaryfile_slave3.txt.$dt|awk -F ";" '{print $1 ";" $6}' > txn.txt.$dt
cat tps_m.$dt tps_s1.$dt tps_s2.$dt tps_s3.$dt tps_s4.$dt tps_s5.$dt tps_s6.$dt tps_s7.$dt tps_s8.$dt|addup > tps_all_8apps.$dt
cat tps_nr_?.$dt|addup >tps_all_8apps_nr.$dt
cat rars_stat_m.txt.$dt rars_stat_s1.txt.$dt rars_stat_s2.txt.$dt rars_stat_s3.txt.$dt rars_stat_s4.txt.$dt rars_stat_s5.txt.$dt rars_stat_s6.txt.$dt rars_stat_s7.txt.$dt > rars_stat_8apps.txt.$dt
cat ora_sy1000_m.txt.$dt ora_sy1000_s1.txt.$dt ora_sy1000_s2.txt.$dt ora_sy1000_s3.txt.$dt ora_sy1000_s4.txt.$dt > ora_sy1000.txt.$dt
cat post_count_IN0820_*.txt.${dt}|addup>post_count_IN0820.txt.${dt}
#echo rtgsngingateway_i.txt.$dt","rtgsngingateway_I.txt.$dt","rtgsngingateway_a.txt.$dt","rtgsngingateway_b.txt.$dt","rtgsngingateway_c.txt.$dt","rtgsngingateway_d.txt.$dt","rtgsngingateway_e.txt.$dt","rtgsngingateway_f.txt.$dt","rtgsngingateway_g.txt.$dt ","rtgsngingateway_h.txt.$dt","rtgsngingateway_j.txt.$dt","rtgsngingateway_k.txt.$dt>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/rtgsngingateway_12apps.txt.$dt
paste -d "," rtgsngingateway_i.txt.$dt rtgsngingateway_I.txt.$dt rtgsngingateway_a.txt.$dt rtgsngingateway_b.txt.$dt rtgsngingateway_c.txt.$dt rtgsngingateway_d.txt.$dt rtgsngingateway_e.txt.$dt rtgsngingateway_f.txt.$dt rtgsngingateway_g.txt.$dt  rtgsngingateway_h.txt.$dt rtgsngingateway_j.txt.$dt rtgsngingateway_k.txt.$dt rtgsngingateway_m.txt.$dt rtgsngingateway_n.txt.$dt rtgsngingateway_p.txt.$dt rtgsngingateway_q.txt.$dt>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/rtgsngingateway_12apps.txt.$dt
paste -d "," output_M.txt_$dt output_S1.txt_$dt output_S2.txt_$dt output_S3.txt_$dt output_S4.txt_$dt output_S5.txt_$dt >output.txt_$dt
#paste -d "," B24_TXN_DT_app*.txt.$dt >B24_TXN_DT_9app.txt.$dt
#paste -d "," B24_TXN_DT_app1.txt.$dt B24_TXN_DT_app2.txt.$dt B24_TXN_DT_app3.txt.$dt B24_TXN_DT_app4.txt.$dt B24_TXN_DT_app5.txt.$dt B24_TXN_DT_app6.txt.$dt B24_TXN_DT_app7.txt.$dt B24_TXN_DT_app8.txt.$dt B24_TXN_DT_app9.txt.$dt >B24_TXN_DT_9app.txt.$dt
#paste -d "," ATM_TXN_DT_app*.txt.$dt >ATM_TXN_DT_9app.txt.$dt
#paste -d "," INB_TXN_DT_app*.txt.$dt >INB_TXN_DT_9app.txt.$dt
#paste -d "," MR_TXN_DT_app*.txt.$dt >MR_TXN_DT_9app.txt.$dt
#paste -d "," B24_TXN_DT_app*.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/B24_TXN_DT_9app_appended.txt.$dt
#paste -d "," ATM_TXN_DT_app*.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/ATM_TXN_DT_9app_appended.txt.$dt
#paste -d "," INB_TXN_DT_app*.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/INB_TXN_DT_9app_appended.txt.$dt
#paste -d "," MR_TXN_DT_app*.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/MR_TXN_DT_9app_appended.txt.$dt

#ls ATM_TXN_DT_app*.txt.$dt|sort|xargs paste -d ','>ATM_TXN_DT_9app.txt.$dt
#ls B24_TXN_DT_app*.txt.$dt|sort|xargs paste -d ','>B24_TXN_DT_9app.txt.$dt
#ls INB_TXN_DT_app*.txt.$dt|sort|xargs paste -d ','>INB_TXN_DT_9app.txt.$dt
#ls MR_TXN_DT_app*.txt.$dt|sort|xargs paste -d ','>MR_TXN_DT_9app.txt.$dt

paste -d "|" channel_log_app1_$dt.txt channel_log_app2_$dt.txt channel_log_app3_$dt.txt channel_log_app4_$dt.txt channel_log_app5_$dt.txt channel_log_app6_$dt.txt channel_log_app7_$dt.txt channel_log_app8_$dt.txt channel_log_app9_$dt.txt channel_log_app10_$dt.txt channel_log_app11_$dt.txt channel_log_app12_$dt.txt>channel_log_12app_$dt.txt

paste -d "," ATM_TXN_DT_app1.txt.$dt ATM_TXN_DT_app2.txt.$dt ATM_TXN_DT_app3.txt.$dt ATM_TXN_DT_app4.txt.$dt ATM_TXN_DT_app5.txt.$dt ATM_TXN_DT_app6.txt.$dt ATM_TXN_DT_app7.txt.$dt ATM_TXN_DT_app8.txt.$dt ATM_TXN_DT_app9.txt.$dt ATM_TXN_DT_app10.txt.$dt ATM_TXN_DT_app11.txt.$dt ATM_TXN_DT_app12.txt.$dt > ATM_TXN_DT_9app.txt.$dt

paste -d "," INB_TXN_DT_app1.txt.$dt INB_TXN_DT_app2.txt.$dt INB_TXN_DT_app3.txt.$dt INB_TXN_DT_app4.txt.$dt INB_TXN_DT_app5.txt.$dt INB_TXN_DT_app6.txt.$dt INB_TXN_DT_app7.txt.$dt INB_TXN_DT_app8.txt.$dt INB_TXN_DT_app9.txt.$dt INB_TXN_DT_app10.txt.$dt INB_TXN_DT_app11.txt.$dt INB_TXN_DT_app12.txt.$dt > INB_TXN_DT_9app.txt.$dt

paste -d "," B24_TXN_DT_app1.txt.$dt B24_TXN_DT_app2.txt.$dt B24_TXN_DT_app3.txt.$dt B24_TXN_DT_app4.txt.$dt B24_TXN_DT_app5.txt.$dt B24_TXN_DT_app6.txt.$dt B24_TXN_DT_app7.txt.$dt B24_TXN_DT_app8.txt.$dt B24_TXN_DT_app9.txt.$dt B24_TXN_DT_app10.txt.$dt B24_TXN_DT_app11.txt.$dt B24_TXN_DT_app12.txt.$dt > B24_TXN_DT_9app.txt.$dt

paste -d "," MR_TXN_DT_app1.txt.$dt MR_TXN_DT_app2.txt.$dt MR_TXN_DT_app3.txt.$dt MR_TXN_DT_app4.txt.$dt MR_TXN_DT_app5.txt.$dt MR_TXN_DT_app6.txt.$dt MR_TXN_DT_app7.txt.$dt MR_TXN_DT_app8.txt.$dt MR_TXN_DT_app9.txt.$dt MR_TXN_DT_app10.txt.$dt MR_TXN_DT_app11.txt.$dt MR_TXN_DT_app12.txt.$dt > MR_TXN_DT_9app.txt.$dt


paste -d "," ATM_TXN_DT_app1.txt.$dt ATM_TXN_DT_app2.txt.$dt ATM_TXN_DT_app3.txt.$dt ATM_TXN_DT_app4.txt.$dt ATM_TXN_DT_app5.txt.$dt ATM_TXN_DT_app6.txt.$dt ATM_TXN_DT_app7.txt.$dt ATM_TXN_DT_app8.txt.$dt ATM_TXN_DT_app9.txt.$dt ATM_TXN_DT_app10.txt.$dt ATM_TXN_DT_app11.txt.$dt ATM_TXN_DT_app12.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/ATM_TXN_DT_9app.txt.$dt


paste -d "," B24_TXN_DT_app1.txt.$dt B24_TXN_DT_app2.txt.$dt B24_TXN_DT_app3.txt.$dt B24_TXN_DT_app4.txt.$dt B24_TXN_DT_app5.txt.$dt B24_TXN_DT_app6.txt.$dt B24_TXN_DT_app7.txt.$dt B24_TXN_DT_app8.txt.$dt B24_TXN_DT_app9.txt.$dt B24_TXN_DT_app10.txt.$dt B24_TXN_DT_app11.txt.$dt B24_TXN_DT_app12.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/B24_TXN_DT_9app.txt.$dt


paste -d "," INB_TXN_DT_app1.txt.$dt INB_TXN_DT_app2.txt.$dt INB_TXN_DT_app3.txt.$dt INB_TXN_DT_app4.txt.$dt INB_TXN_DT_app5.txt.$dt INB_TXN_DT_app6.txt.$dt INB_TXN_DT_app7.txt.$dt INB_TXN_DT_app8.txt.$dt INB_TXN_DT_app9.txt.$dt INB_TXN_DT_app10.txt.$dt INB_TXN_DT_app11.txt.$dt INB_TXN_DT_app12.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/INB_TXN_DT_9app.txt.$dt


paste -d "," MR_TXN_DT_app1.txt.$dt MR_TXN_DT_app2.txt.$dt MR_TXN_DT_app3.txt.$dt MR_TXN_DT_app4.txt.$dt MR_TXN_DT_app5.txt.$dt MR_TXN_DT_app6.txt.$dt MR_TXN_DT_app7.txt.$dt MR_TXN_DT_app8.txt.$dt MR_TXN_DT_app9.txt.$dt MR_TXN_DT_app10.txt.$dt MR_TXN_DT_app11.txt.$dt MR_TXN_DT_app12.txt.$dt >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/MR_TXN_DT_9app.txt.$dt

paste -d "," rtgs_incoming_rbi_flag_i.txt.$dt rtgs_incoming_rbi_flag_I.txt.$dt rtgs_incoming_rbi_flag_a.txt.$dt rtgs_incoming_rbi_flag_b.txt.$dt rtgs_incoming_rbi_flag_c.txt.$dt rtgs_incoming_rbi_flag_d.txt.$dt rtgs_incoming_rbi_flag_e.txt.$dt rtgs_incoming_rbi_flag_f.txt.$dt rtgs_incoming_rbi_flag_g.txt.$dt rtgs_incoming_rbi_flag_h.txt.$dt rtgs_incoming_rbi_flag_j.txt.$dt rtgs_incoming_rbi_flag_k.txt.$dt rtgs_incoming_rbi_flag_m.txt.$dt rtgs_incoming_rbi_flag_n.txt.$dt rtgs_incoming_rbi_flag_p.txt.$dt  rtgs_incoming_rbi_flag_q.txt.$dt  >/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/rtgs_incoming_rbi_12apps.txt.$dt

paste -d "," rtgs_outgoing_psg_i.txt.$dt rtgs_outgoing_psg_I.txt.$dt rtgs_outgoing_psg_a.txt.$dt rtgs_outgoing_psg_b.txt.$dt rtgs_outgoing_psg_c.txt.$dt rtgs_outgoing_psg_d.txt.$dt rtgs_outgoing_psg_e.txt.$dt rtgs_outgoing_psg_f.txt.$dt rtgs_outgoing_psg_g.txt.$dt rtgs_outgoing_psg_h.txt.$dt rtgs_outgoing_psg_j.txt.$dt rtgs_outgoing_psg_k.txt.$dt rtgs_outgoing_psg_m.txt.$dt rtgs_outgoing_psg_n.txt.$dt rtgs_outgoing_psg_p.txt.$dt rtgs_outgoing_psg_q.txt.$dt >rtgs_outgoing_psg_12apps.txt.$dt

paste -d "\n" sms_cbs_ne_i.txt_$dt sms_cbs_ne_I.txt_$dt sms_cbs_ne_a.txt_$dt sms_cbs_ne_b.txt_$dt sms_cbs_ne_c.txt_$dt sms_cbs_ne_d.txt_$dt  sms_cbs_ne_e.txt_$dt sms_cbs_ne_f.txt_$dt sms_cbs_ne_g.txt_$dt sms_cbs_ne_h.txt_$dt sms_cbs_ne_j.txt_$dt sms_cbs_ne_k.txt_$dt>sms_cbs_ne_12apps.txt_$dt

paste -d "\n" i_EIS.txt.$dt I_EIS.txt.$dt a_EIS.txt.$dt b_EIS.txt.$dt c_EIS.txt.$dt d_EIS.txt.$dt e_EIS.txt.$dt f_EIS.txt.$dt g_EIS.txt.$dt h_EIS.txt.$dt j_EIS.txt.$dt k_EIS.txt.$dt>12apps_eis_data.txt.$dt

cat inb_port_m.txt_$dt inb_port_s1.txt_$dt inb_port_s2.txt_$dt inb_port_s5.txt_$dt > inb_port.txt.$dt
cat inb_port_all5_m.txt_$dt inb_port_all5_s1.txt_$dt inb_port_all5_s2.txt_$dt inb_port_all5_s4.txt_$dt inb_port_all5_s5.txt_$dt inb_port_all5_s6.txt_$dt> inb_port_all5.txt.$dt


cat /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/tpmtps_pr_200.txt.$dt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/tpmtps_nr_200.txt.$dt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/tpmtps_dr_200.txt.$dt>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/APPENDED/DATA/tpmtps_merged_200.txt.$dt


#MQ Status Addition
################################################

paste -d ',' RTGS.txt mq_rtgs_status_i.txt mq_rtgs_status_I.txt mq_rtgs_status_a.txt mq_rtgs_status_b.txt mq_rtgs_status_c.txt mq_rtgs_status_d.txt mq_rtgs_status_e.txt mq_rtgs_status_f.txt mq_rtgs_status_g.txt  mq_rtgs_status_h.txt mq_rtgs_status_j.txt  mq_rtgs_status_k.txt mq_rtgs_status_m.txt mq_rtgs_status_n.txt mq_rtgs_status_p.txt mq_rtgs_status_q.txt >mq_status_12apps.txt.${dt}
paste -d ',' NEFT.txt mq_neft_status_i.txt mq_neft_status_I.txt mq_neft_status_a.txt mq_neft_status_b.txt mq_neft_status_c.txt mq_neft_status_d.txt mq_neft_status_e.txt mq_neft_status_f.txt mq_neft_status_g.txt  mq_neft_status_h.txt mq_neft_status_j.txt  mq_neft_status_k.txt mq_neft_status_m.txt mq_neft_status_n.txt mq_neft_status_p.txt mq_neft_status_q.txt >>mq_status_12apps.txt.${dt}
paste -d ',' IMPS.txt mq_imps_status_i.txt mq_imps_status_I.txt mq_imps_status_a.txt mq_imps_status_b.txt mq_imps_status_c.txt mq_imps_status_d.txt mq_imps_status_e.txt mq_imps_status_f.txt mq_imps_status_g.txt  mq_imps_status_h.txt mq_imps_status_j.txt  mq_imps_status_k.txt mq_imps_status_m.txt mq_imps_status_n.txt mq_imps_status_p.txt mq_imps_status_q.txt >>mq_status_12apps.txt.${dt}

################################################

#MITHI SCRIPT Addition
################################################

>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/glif_load_status_temp.txt
prodc=0
loadc=0
tt=0
for i in `ls /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/check_glifload.txt_???`
do
filename=`echo $i | awk -F '/' '{print $NF}' | awk '{print substr($0,7,8) substr($0,19,4)}'`
pcount=`cat $i| grep 'Production Count' | head -1 | awk '{print $NF}'`
compload=`cat $i | grep 'Records_Loaded' | head -1 | awk '{print $NF}'`
prodc=`expr $prodc + $pcount`
loadc=`expr $loadc + $compload`
stat=`cat $i | grep 'Status' | head -1 | awk -F ',' '{print $2}' | cut -c 6-`
stime=`cat $i | grep 'Start Time' | head -1 | awk '{print $NF}'`
etime=`cat $i | grep 'End Time' | head -1 | awk '{print $NF}'`
time=`cat $i | grep 'Time Duration ' | head -1 | awk '{print $NF}'`
echo "$filename,$pcount,$compload,$stat,$stime,$etime,$time" >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/glif_load_status_temp.txt
done
echo "Total,$prodc,$loadc,,,,$tt" >>/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/glif_load_status_temp.txt
mv /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/glif_load_status_temp.txt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/MITHI/glif_load_status.txt_$dt

#Mithi Portion ends here.
#################################################

##paste -d "," start_time.txt_m.$dt start_time.txt_s1.$dt start_time.txt_s2.$dt start_time.txt_s3.$dt start_time.txt_s4.$dt start_time.txt_s5.$dt start_time.txt_s6.$dt start_time.txt_s7.$dt > start_time_8app.txt.$dt
#cheque dishonor misc
paste -d "," output_5588_0002_s2.txt.$dt output_5588_0002_s3.txt.$dt output_5588_0002_s4.txt.$dt output_5588_0002_s5.txt.$dt >output_5588_0002.txt.$dt
cat ftp_inb_i.txt.$dt ftp_inb_I.txt.$dt ftp_inb_a.txt.$dt ftp_inb_c.txt.$dt ftp_inb_d.txt.$dt ftp_inb_e.txt.$dt>ftp_inb.txt.$dt
cat SY3000_final_m.txt.$dt SY3000_final_s1.txt.$dt SY3000_final_s2.txt.$dt SY3000_final_s3.txt.$dt SY3000_final_s4.txt.$dt SY3000_final_s5.txt.$dt SY3000_final_s6.txt.$dt SY3000_final_s7.txt.$dt > SY3000_8apps.txt.$dt
PROC_POSTD=`awk -F "," '{print $6}' SY3000_8apps.txt.$dt|addup`
FAILED=`awk -F "," '{print $7}' SY3000_8apps.txt.$dt|addup`
PROC_NT_POST=`awk -F "," '{print $8}' SY3000_8apps.txt.$dt|addup`
PROCSNG=`awk -F "," '{print $9}' SY3000_8apps.txt.$dt|addup`
UNPR=`awk -F "," '{print $10}' SY3000_8apps.txt.$dt|addup`
echo "TOTAL, , , , ,$PROC_POSTD,$FAILED,$PROC_NT_POST,$PROCSNG,$UNPR" >>SY3000_8apps.txt.$dt
 a=`cat SY3000_8apps.txt.$dt|grep TOTAL|cut -d "," -f10`
 b=`cat SY3000_8apps.txt.$dt|grep TOTAL|cut -d "," -f7`
 c=`cat SY3000_8apps.txt.$dt|grep TOTAL|cut -d "," -f8`
 d=`cat SY3000_8apps.txt.$dt|grep TOTAL|cut -d "," -f9`
 e=`cat SY3000_8apps.txt.$dt|grep TOTAL|cut -d "," -f6`
echo "$a,$b,$c,$d,$e" > sy3000.txt_11.$dt
paste -d "," online_count.txt_tmp.$dt sy3000.txt_11.$dt > online_count.txt.$dt
#cheque dishonor misc


cat in0820compl_pay_i.txt.$dt in0820compl_pay_I.txt.$dt in0820compl_pay_a.txt.$dt in0820compl_pay_b.txt.$dt in0820compl_pay_c.txt.$dt in0820compl_pay_d.txt.$dt  in0820compl_pay_e.txt.$dt in0820compl_pay_f.txt.$dt in0820compl_pay_g.txt.$dt in0820compl_pay_h.txt.$dt in0820compl_pay_j.txt.$dt in0820compl_pay_k.txt.$dt>in0820compl_pay.txt.$dt
total_rec=`cat in0820compl_pay.txt.$dt|awk -F "," '{print $2}'|tr -d " "|addup`
echo "Total," $total_rec>>in0820compl_pay.txt.$dt


#scp -p cdcmon@10.192.20.91:/tmp/loggap_dr.txt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/.
#scp -p cdcmon@10.189.20.51:/tmp/loggap.txt /opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/.
/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/movefilefinal.sh

cd /opt/hpws/apache/cgi-bin/trials/bip/data/EOD
./merge_eod_8apps_online
cd -
done
#i=1
#while [ $i -le 21 ]
#do
#        cat time$i.txt_m.$dt time$i.txt_s1.$dt time$i.txt_s2.$dt time$i.txt_s3.$dt time$i.txt_s4.$dt time$i.txt_s5.$dt time$i.txt_s6.$dt time$i.txt_s7.$dt > time$i.txt.$dt
#        i=`expr $i + 1`
#done
paste -d "," rtgsng_ack_in_i.txt.$dt rtgsng_ack_in_I.txt.$dt rtgsng_ack_in_a.txt.$dt rtgsng_ack_in_b.txt.$dt rtgsng_ack_in_c.txt.$dt rtgsng_ack_in_d.txt.$dt rtgsng_ack_in_e.txt.$dt rtgsng_ack_in_f.txt.$dt rtgsng_ack_in_g.txt.$dt  rtgsng_ack_in_h.txt.$dt rtgsng_ack_in_j.txt.$dt rtgsng_ack_in_k.txt.$dt rtgsng_ack_in_m.txt.$dt rtgsng_ack_in_n.txt.$dt rtgsng_ack_in_p.txt.$dt rtgsng_ack_in_q.txt.$dt  >/opt/hpws/apache/cgi-bin/trials/bip/data/TESTING/rtgsng_ack_in_12apps.txt.$dt
